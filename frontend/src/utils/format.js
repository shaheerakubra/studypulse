export const STATUS_LABELS = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};

export function formatDue(iso) {
  if (!iso) return "No date";
  const due = new Date(iso);
  return due.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function dueIn(iso) {
  const ms = new Date(iso).getTime() - Date.now();
  const hours = ms / 36e5;
  if (hours < 0) return "Overdue";
  if (hours < 24) return `${Math.max(1, Math.round(hours))}h left`;
  return `${Math.ceil(hours / 24)}d left`;
}

export function toDatetimeLocal(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function courseById(courses, id) {
  return (courses || []).find((c) => c.id === id);
}
