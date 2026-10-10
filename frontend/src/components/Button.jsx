import { forwardRef } from "react";

export const Button = forwardRef(function Button(
  { children, variant = "primary", ...props },
  ref
) {
  const cls = variant === "primary" ? "btn" : `btn ${variant}`;
  return (
    <button ref={ref} className={cls} {...props}>
      {children}
    </button>
  );
});
