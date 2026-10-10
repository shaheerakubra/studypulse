import { useState } from "react";
import { FormField } from "./FormField";
import { Button } from "./Button";
import { toDatetimeLocal } from "../utils/format";

export function TaskForm({ initial, courses, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState({
    courseId: initial?.courseId || courses[0]?.id || "",
    title: initial?.title || "",
    type: initial?.type || "assignment",
    dueDate: toDatetimeLocal(initial?.dueDate) || "",
    estimatedHours: initial?.estimatedHours ?? 3,
    weight: initial?.weight ?? 10,
    status: initial?.status || "not_started",
    notes: initial?.notes || "",
  });
  const [errors, setErrors] = useState({});

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate() {
    const next = {};
    if (!form.courseId) next.courseId = "Select a course.";
    if (!form.title.trim()) next.title = "Title is required.";
    if (!form.dueDate) next.dueDate = "Due date is required.";
    if (Number(form.estimatedHours) < 0.25) next.estimatedHours = "Effort must be at least 0.25 hours.";
    if (Number(form.weight) < 0 || Number(form.weight) > 100) {
      next.weight = "Weight must be between 0 and 100.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({
      ...form,
      estimatedHours: Number(form.estimatedHours),
      weight: Number(form.weight),
      dueDate: new Date(form.dueDate).toISOString(),
    });
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <FormField label="Title" error={errors.title}>
        <input value={form.title} onChange={(e) => update("title", e.target.value)} />
      </FormField>
      <div className="form-grid two">
        <FormField label="Course" error={errors.courseId}>
          <select value={form.courseId} onChange={(e) => update("courseId", e.target.value)}>
            <option value="">Select course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Type">
          <select value={form.type} onChange={(e) => update("type", e.target.value)}>
            <option value="assignment">Assignment</option>
            <option value="exam">Exam</option>
          </select>
        </FormField>
      </div>
      <div className="form-grid two">
        <FormField label="Due date" error={errors.dueDate}>
          <input
            type="datetime-local"
            value={form.dueDate}
            onChange={(e) => update("dueDate", e.target.value)}
          />
        </FormField>
        <FormField label="Status">
          <select value={form.status} onChange={(e) => update("status", e.target.value)}>
            <option value="not_started">Not started</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
        </FormField>
      </div>
      <div className="form-grid two">
        <FormField label="Estimated effort (hours)" error={errors.estimatedHours}>
          <input
            type="number"
            min="0.25"
            step="0.25"
            value={form.estimatedHours}
            onChange={(e) => update("estimatedHours", e.target.value)}
          />
        </FormField>
        <FormField label="Grading weight (%)" error={errors.weight}>
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            value={form.weight}
            onChange={(e) => update("weight", e.target.value)}
          />
        </FormField>
      </div>
      <FormField label="Notes">
        <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} />
      </FormField>
      <div className="actions">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save item"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
