import { useEffect, useId, useRef } from "react";
import { Button } from "./Button";

export function Modal({ title, children, onClose }) {
  const titleId = useId();
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="page-header" style={{ marginBottom: 14 }}>
          <h3 id={titleId} style={{ margin: 0 }}>{title}</h3>
          <Button ref={closeRef} variant="secondary" onClick={onClose} type="button">
            Close
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
