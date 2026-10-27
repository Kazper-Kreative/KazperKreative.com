import { Fragment, type ReactNode } from "react";

// A deliberately tiny markdown renderer for Kazper's replies: paragraphs,
// headings, bullet/numbered lists, code blocks, **bold**, *italic* and `code`.
// It builds React elements (never raw HTML), so text quoted from email or Slack
// can't inject markup. Links render as plain text on purpose (Tier 0 rule:
// no clickable URLs Kazper didn't get from a trusted source).

function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*|_[^_\s][^_]*_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const k = `${key}-${i++}`;
    if (tok.startsWith("**")) out.push(<strong key={k}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("`")) out.push(<code key={k}>{tok.slice(1, -1)}</code>);
    else out.push(<em key={k}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function Markdown({ text }: { text: string }) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let b = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
      i++;
      blocks.push(<pre key={b++}><code>{code.join("\n")}</code></pre>);
    } else if (/^\s*[-*•]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*•]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*•]\s+/, ""));
      blocks.push(<ul key={b++}>{items.map((t, j) => <li key={j}>{inline(t, `${b}-${j}`)}</li>)}</ul>);
    } else if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+[.)]\s+/, ""));
      blocks.push(<ol key={b++}>{items.map((t, j) => <li key={j}>{inline(t, `${b}-${j}`)}</li>)}</ol>);
    } else if (/^#{1,6}\s+/.test(line)) {
      blocks.push(<p key={b++} className="kz-md-h">{inline(line.replace(/^#{1,6}\s+/, ""), `${b}`)}</p>);
      i++;
    } else if (!line.trim()) {
      i++;
    } else {
      const para: string[] = [];
      while (i < lines.length && lines[i].trim() && !/^(```|\s*[-*•]\s+|\s*\d+[.)]\s+|#{1,6}\s+)/.test(lines[i])) {
        para.push(lines[i++]);
      }
      blocks.push(
        <p key={b++}>
          {para.map((l, j) => (
            <Fragment key={j}>
              {j > 0 && <br />}
              {inline(l, `${b}-${j}`)}
            </Fragment>
          ))}
        </p>,
      );
    }
  }
  return <div className="kz-md">{blocks}</div>;
}
