import { useState } from "react";
import { FormField } from "./FormField";
import { Button } from "./Button";

const COLORS = ["#1B6B93", "#8C4A2F", "#2F6B4F", "#5B4B8A", "#A15C38", "#2F5D7A"];

export function CourseForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState({
    code: initial?.code || "",
    name: initial?.name || "",
    instructor: initial?.instructor || "",
    credits: initial?.credits ?? 3,
    color: initial?.color || COLORS[0],
    term: initial?.term || "Fall 2026",
  });
  const [errors, setErrors] = useState({});

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate() {
    const next = {};
    if (!form.code.trim()) next.code = "Course code is required.";
    if (!form.name.trim()) next.name = "Course name is required.";
    if (Number(form.credits) < 0 || Number(form.credits) > 12) {
      next.credits = "Credits must be between 0 and 12.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({
      ...form,
      credits: Number(form.credits),
    });
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="form-grid two">
        <FormField label="Course code" error={errors.code}>
          <input value={form.code} onChange={(e) => update("code", e.target.value)} />
        </FormField>
        <FormField label="Credits" error={errors.credits}>
          <input
            type="number"
            min="0"
            max="12"
            step="0.5"
            value={form.credits}
            onChange={(e) => update("credits", e.target.value)}
          />
        </FormField>
      </div>
      <FormField label="Course name" error={errors.name}>
        <input value={form.name} onChange={(e) => update("name", e.target.value)} />
      </FormField>
      <div className="form-grid two">
        <FormField label="Instructor">
          <input
            value={form.instructor}
            onChange={(e) => update("instructor", e.target.value)}
          />
        </FormField>
        <FormField label="Term">
          <input value={form.term} onChange={(e) => update("term", e.target.value)} />
        </FormField>
      </div>
      <FormField label="Color">
        <select value={form.color} onChange={(e) => update("color", e.target.value)}>
          {COLORS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </FormField>
      <div className="actions">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save course"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
