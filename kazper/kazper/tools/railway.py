"""Railway, read-only, via the public GraphQL API.

Railway tokens can't be scoped to read-only, so Tier 0 is enforced here:
every request below is a fixed `query`, and nothing in this module ever
sends a mutation. Use a *workspace* token (not an account token) so a leak
can't reach beyond that workspace.
"""

from datetime import datetime, timedelta, timezone

import httpx

from . import Tool, Toolbox, schema

API_URL = "https://backboard.railway.com/graphql/v2"
BAD_STATUSES = {"FAILED", "CRASHED"}

OVERVIEW = """
query overview($workspaceId: String) {
  projects(workspaceId: $workspaceId) {
    edges { node {
      id name
      environments { edges { node {
        id name
        serviceInstances { edges { node {
          serviceId serviceName
          latestDeployment { id status createdAt meta }
        } } }
      } } }
    } }
  }
}"""

DEPLOYMENTS = """
query deployments($input: DeploymentListInput!, $first: Int) {
  deployments(input: $input, first: $first) {
    edges { node { id status createdAt serviceId environmentId meta } }
  }
}"""

DEPLOY_LOGS = """
query logs($deploymentId: String!, $limit: Int, $filter: String) {
  deploymentLogs(deploymentId: $deploymentId, limit: $limit, filter: $filter) { timestamp severity message }
}"""

BUILD_LOGS = """
query logs($deploymentId: String!, $limit: Int, $filter: String) {
  buildLogs(deploymentId: $deploymentId, limit: $limit, filter: $filter) { timestamp severity message }
}"""


class Railway:
    def __init__(self, api_token: str):
        self.http = httpx.Client(headers={"Authorization": f"Bearer {api_token}"}, timeout=30)
        self._workspace_id: str | None = None
        self._workspace_checked = False

    def _query(self, query: str, **variables) -> dict:
        resp = self.http.post(API_URL, json={"query": query, "variables": variables})
        if resp.status_code == 429:
            raise RuntimeError(f"Railway rate limit hit; retry after {resp.headers.get('Retry-After', '?')}s")
        body = resp.json()
        if body.get("errors"):
            raise RuntimeError("Railway: " + "; ".join(e.get("message", "?") for e in body["errors"]))
        return body["data"]

    def _workspace(self) -> str | None:
        # Workspace tokens must name their workspace when listing projects; account tokens needn't.
        if not self._workspace_checked:
            try:
                self._workspace_id = (self._query("query { apiToken { workspaceId } }").get("apiToken") or {}).get("workspaceId")
            except RuntimeError:
                self._workspace_id = None
            self._workspace_checked = True
        return self._workspace_id

    def _instances(self) -> list[dict]:
        """Every service in every environment, flattened, with its latest deployment."""
        data = self._query(OVERVIEW, workspaceId=self._workspace())
        out = []
        for p in _nodes(data["projects"]):
            for env in _nodes(p["environments"]):
                for si in _nodes(env["serviceInstances"]):
                    out.append({
                        "project": p["name"], "project_id": p["id"],
                        "environment": env["name"], "environment_id": env["id"],
                        "service": si["serviceName"], "service_id": si["serviceId"],
                        "latest": si.get("latestDeployment"),
                    })
        return out

    def _find(self, service: str, project: str | None, environment: str) -> dict:
        def match(a: str, b: str | None) -> bool:
            return b is None or a.lower() == b.lower()

        hits = [i for i in self._instances()
                if match(i["service"], service) and match(i["project"], project) and match(i["environment"], environment)]
        if not hits:
            raise ValueError(f"no Railway service '{service}' (project={project}, environment={environment}); "
                             "call railway_overview to see what exists")
        if len(hits) > 1:
            raise ValueError(f"'{service}' is in several projects ({', '.join(h['project'] for h in hits)}); pass project")
        return hits[0]

    def overview(self) -> list[dict]:
        return [
            {
                "project": i["project"], "environment": i["environment"], "service": i["service"],
                **_deployment(i["latest"]),
            }
            for i in self._instances()
        ]

    def deployments(self, service: str, project: str | None = None, environment: str = "production",
                    limit: int = 10) -> list[dict]:
        inst = self._find(service, project, environment)
        data = self._query(DEPLOYMENTS, first=min(limit, 30), input={
            "projectId": inst["project_id"], "serviceId": inst["service_id"], "environmentId": inst["environment_id"],
        })
        return [_deployment(d) for d in _nodes(data["deployments"])]

    def logs(self, service: str, project: str | None = None, environment: str = "production", kind: str = "deploy",
             filter: str | None = None, limit: int = 100, deployment_id: str | None = None) -> list[dict]:
        if not deployment_id:
            latest = self._find(service, project, environment)["latest"]
            if not latest:
                return []
            deployment_id = latest["id"]
        query = BUILD_LOGS if kind == "build" else DEPLOY_LOGS
        data = self._query(query, deploymentId=deployment_id, limit=min(limit, 300), filter=filter or None)
        rows = data["buildLogs" if kind == "build" else "deploymentLogs"] or []
        return [{"time": r["timestamp"], "severity": r.get("severity"), "message": (r.get("message") or "")[:500]}
                for r in rows]

    def problems(self, hours: float = 24) -> list[dict]:
        """Failed/crashed deploys in the last N hours, plus anything whose latest deploy is still down."""
        cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
        instances = self._instances()
        names = {(i["service_id"], i["environment_id"]): i for i in instances}
        out, seen = [], set()
        for project_id in {i["project_id"] for i in instances}:
            data = self._query(DEPLOYMENTS, first=30, input={"projectId": project_id})
            for d in _nodes(data["deployments"]):
                if d["status"] not in BAD_STATUSES or _when(d["createdAt"]) < cutoff:
                    continue
                inst = names.get((d["serviceId"], d["environmentId"]), {})
                out.append({"project": inst.get("project"), "environment": inst.get("environment"),
                            "service": inst.get("service"), **_deployment(d)})
                seen.add(d["id"])
        for i in instances:
            latest = i["latest"]
            if latest and latest["status"] in BAD_STATUSES and latest["id"] not in seen:
                out.append({"project": i["project"], "environment": i["environment"], "service": i["service"],
                            **_deployment(latest), "note": "still down (latest deploy)"})
        return out


def _nodes(connection: dict | None) -> list[dict]:
    return [e["node"] for e in (connection or {}).get("edges", [])]


def _when(iso: str) -> datetime:
    return datetime.fromisoformat(iso.replace("Z", "+00:00"))


def _deployment(d: dict | None) -> dict:
    if not d:
        return {"status": "never deployed"}
    meta = d.get("meta") if isinstance(d.get("meta"), dict) else {}
    return {
        "deployment_id": d["id"],
        "status": d["status"],
        "created": d["createdAt"],
        "branch": meta.get("branch"),
        "commit": (meta.get("commitMessage") or "").split("\n")[0][:200] or None,
    }


def register(box: Toolbox, railway: Railway) -> None:
    where = {
        "service": {"type": "string", "description": "Service name, e.g. 'kazper'."},
        "project": {"type": "string", "description": "Project name; only needed if the service name is ambiguous."},
        "environment": {"type": "string", "description": "Environment name (default 'production')."},
    }
    box.add(Tool(
        "railway_overview",
        "List my Railway projects, environments and services, with each service's latest deploy status "
        "(SUCCESS, FAILED, CRASHED, BUILDING, SLEEPING…), time and commit.",
        schema(),
        railway.overview,
    ))
    box.add(Tool(
        "railway_deployments",
        "Recent deploys of one Railway service: status, time, branch and commit message.",
        schema({**where, "limit": {"type": "integer", "description": "Max deploys (default 10)."}}, ["service"]),
        railway.deployments,
    ))
    box.add(Tool(
        "railway_logs",
        "Logs of a Railway service's latest deploy (or a given deployment_id). kind='deploy' for runtime logs, "
        "'build' for build logs. filter uses Railway log syntax, e.g. '@level:error' or a plain keyword.",
        schema({
            **where,
            "kind": {"type": "string", "enum": ["deploy", "build"]},
            "filter": {"type": "string"},
            "limit": {"type": "integer", "description": "Max lines (default 100)."},
            "deployment_id": {"type": "string"},
        }, ["service"]),
        railway.logs,
    ))
    box.add(Tool(
        "railway_problems",
        "Failed or crashed Railway deploys in the last N hours, plus any service whose latest deploy is still down.",
        schema({"hours": {"type": "number", "description": "Look-back window in hours (default 24)."}}),
        railway.problems,
    ))
    box.senses.append("Railway deploys + logs (read-only)")
