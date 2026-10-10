export function LoadingState({ label = "Loading academic data…" }) {
  return <div className="loading" role="status" aria-live="polite">{label}</div>;
}

export function EmptyState({ label }) {
  return <div className="empty" role="status">{label}</div>;
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return <div className="banner" role="alert" aria-live="assertive">{message}</div>;
}
