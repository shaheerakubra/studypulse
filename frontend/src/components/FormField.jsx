export function FormField({
  label,
  error,
  children,
}) {
  return (
    <label>
      {label}
      {children}
      {error ? <span className="field-error" role="alert">{error}</span> : null}
    </label>
  );
}
