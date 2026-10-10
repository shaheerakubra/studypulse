import { formatDue } from "../utils/format";
import { Badge } from "./Badge";
import { EmptyState } from "./Status";

export function NextUpPanel({ recommendation }) {
  const next = recommendation?.next;
  if (!next) {
    return <EmptyState label="No open work to recommend yet." />;
  }
  return (
    <div>
      <Badge level="low">What should I work on next?</Badge>
      <h4>
        {next.courseCode}: {next.title}
      </h4>
      <p>{next.explanation}</p>
      <p className="meta">
        Due {formatDue(next.dueDate)} · {next.estimatedHours}h · weight {next.weight}% ·{" "}
        {next.type}
      </p>
    </div>
  );
}
