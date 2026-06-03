// Pure entitlement logic for the Lab paywall. NO server/next imports here so
// it's safe to use from middleware (edge) AND server components alike.

export interface LabMember {
  status?: string | null;
  current_period_end?: string | null;
}

// A member has Lab access when their subscription is active or they've been
// comped, and (for paid plans) the current period hasn't lapsed.
export function isEntitled(member: LabMember | null | undefined): boolean {
  if (!member) return false;
  if (member.status !== "active" && member.status !== "comp") return false;
  if (
    member.current_period_end &&
    new Date(member.current_period_end).getTime() < Date.now()
  ) {
    return false;
  }
  return true;
}
