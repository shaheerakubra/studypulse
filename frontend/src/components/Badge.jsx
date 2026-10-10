export function Badge({ level = "neutral", children }) {
  return <span className={`badge ${level}`}>{children}</span>;
}

export function WorkloadBadge({ level }) {
  const label = level ? `${level} workload` : "unknown";
  return <Badge level={level || "neutral"}>{label}</Badge>;
}
