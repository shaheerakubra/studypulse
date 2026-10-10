export function Card({ title, children, className = "" }) {
  return (
    <section className={`card ${className}`}>
      {title ? <h3>{title}</h3> : null}
      {children}
    </section>
  );
}
