import { useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { api } from "./api/client";
import { Layout } from "./components/Layout";
import { Card } from "./components/Card";
import { Button } from "./components/Button";
import { Badge, WorkloadBadge } from "./components/Badge";
import { LoadingState, EmptyState, ErrorBanner } from "./components/Status";
import { Modal } from "./components/Modal";
import { FormField } from "./components/FormField";
import { DeadlineList } from "./components/DeadlineList";
import { CollisionRadar } from "./components/CollisionRadar";
import { NextUpPanel } from "./components/NextUpPanel";
import { CourseForm } from "./components/CourseForm";
import { TaskForm } from "./components/TaskForm";
import { ResponsibleAiNotice } from "./components/ResponsibleAiNotice";
import { useAsync } from "./hooks/useAsync";
import { STATUS_LABELS, courseById, formatDue } from "./utils/format";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

function DashboardPage() {
  const { data, loading, error } = useAsync(() => api.dashboard(), []);
  const student = data?.student;
  const workload = data?.workload;
  const ranked = data?.recommendation?.ranked?.slice(0, 4) || [];

  return (
    <>
      <header className="page-header">
        <div>
          <h2>Student dashboard</h2>
          <p>
            {student
              ? `${student.name} · ${student.program} · ${student.term}`
              : "Your academic workload, collisions, and next action in one place."}
          </p>
        </div>
        {workload ? <WorkloadBadge level={workload.overallLevel} /> : null}
      </header>
      <ErrorBanner message={error} />
      {loading ? <LoadingState /> : null}
      {!loading && data ? (
        <>
          <div className="grid grid-4">
            <Card>
              <div className="stat">
                <span className="label">Open items</span>
                <span className="value">{workload.openCount}</span>
              </div>
            </Card>
            <Card>
              <div className="stat">
                <span className="label">Hours next 7 days</span>
                <span className="value">{workload.hoursNext7Days}h</span>
                <WorkloadBadge level={workload.indicators?.next7Days} />
              </div>
            </Card>
            <Card>
              <div className="stat">
                <span className="label">Hours next 3 days</span>
                <span className="value">{workload.hoursNext3Days}h</span>
                <WorkloadBadge level={workload.indicators?.next3Days} />
              </div>
            </Card>
            <Card>
              <div className="stat">
                <span className="label">Completion</span>
                <span className="value">{workload.completionRate}%</span>
                <span className="meta">
                  {workload.completedCount} done · {workload.inProgressCount} in progress ·{" "}
                  {workload.overdueCount} overdue
                </span>
              </div>
            </Card>
          </div>

          <div className="grid grid-2" style={{ marginTop: 16 }}>
            <Card className="next-up" title="What should I work on next?">
              <NextUpPanel recommendation={data.recommendation} />
            </Card>
            <Card title="Academic workload summary">
              <p className="meta">
                {workload.remainingOpenHours}h remaining across {data.courses.length} courses.
                Weekly capacity is {workload.weeklyCapacityHours}h.
              </p>
              <div className="list" style={{ marginTop: 12 }}>
                {(workload.byCourse || []).map((row) => (
                  <div className="list-item" key={row.courseId}>
                    <div>
                      <h4>
                        <span className="course-chip" style={{ background: row.color }} /> {row.code}
                      </h4>
                      <div className="meta">{row.name}</div>
                    </div>
                    <div className="meta">
                      {row.openTasks} open · {row.remainingHours}h
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid grid-2" style={{ marginTop: 16 }}>
            <Card title="Deadline Collision Radar">
              <CollisionRadar collisions={data.collisions} />
            </Card>
            <Card title="Upcoming deadlines">
              <DeadlineList tasks={data.upcoming} courses={data.courses} />
            </Card>
          </div>

          {ranked.length ? (
            <div style={{ marginTop: 16 }}>
              <Card title="Why these are prioritized">
                <div className="list">
                  {ranked.map((item) => (
                    <article className="list-item" key={item.taskId}>
                      <div>
                        <h4>
                          {item.courseCode}: {item.title}
                        </h4>
                        <p className="meta">{item.explanation}</p>
                      </div>
                      <Badge level="neutral">score {item.score}</Badge>
                    </article>
                  ))}
                </div>
              </Card>
            </div>
          ) : null}

          <div style={{ marginTop: 16 }}>
            <p className="meta">{data.recommendation?.disclaimer}</p>
            <ResponsibleAiNotice />
          </div>
        </>
      ) : null}
    </>
  );
}

function CoursesPage() {
  const { data, loading, error, reload } = useAsync(() => api.courses.list(), []);
  const [modal, setModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const courses = data?.courses || [];

  async function saveCourse(body) {
    setSubmitting(true);
    setFormError("");
    try {
      if (modal?.course) {
        await api.courses.update(modal.course.id, body);
      } else {
        await api.courses.create(body);
      }
      setModal(null);
      await reload();
    } catch (err) {
      setFormError(err.message || "Could not save course.");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeCourse(course) {
    if (!window.confirm(`Delete ${course.code}? Related assignments and exams will also be removed.`)) {
      return;
    }
    try {
      await api.courses.remove(course.id);
      await reload();
    } catch (err) {
      setFormError(err.message || "Could not delete course.");
    }
  }

  return (
    <>
      <header className="page-header">
        <div>
          <h2>Course management</h2>
          <p>Keep every class, credit load, and instructor in one roster.</p>
        </div>
        <Button type="button" onClick={() => setModal({ course: null })}>
          Add course
        </Button>
      </header>
      <ErrorBanner message={error || formError} />
      {loading ? <LoadingState /> : null}
      {!loading && !courses.length ? (
        <EmptyState label="No courses yet. Add your first class to start tracking workload." />
      ) : null}
      {!loading && courses.length ? (
        <Card>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Instructor</th>
                  <th>Credits</th>
                  <th>Term</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <span className="course-chip" style={{ background: course.color }} /> {course.code}
                    </td>
                    <td>{course.name}</td>
                    <td>{course.instructor || "—"}</td>
                    <td>{course.credits}</td>
                    <td>{course.term}</td>
                    <td>
                      <div className="actions">
                        <Button type="button" variant="secondary" onClick={() => setModal({ course })}>
                          Edit
                        </Button>
                        <Button type="button" variant="danger" onClick={() => removeCourse(course)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
      {modal ? (
        <Modal
          title={modal.course ? "Edit course" : "Add course"}
          onClose={() => setModal(null)}
        >
          <CourseForm
            initial={modal.course || undefined}
            submitting={submitting}
            onCancel={() => setModal(null)}
            onSubmit={saveCourse}
          />
        </Modal>
      ) : null}
    </>
  );
}

function TasksPage() {
  const coursesState = useAsync(() => api.courses.list(), []);
  const tasksState = useAsync(() => api.tasks.list(), []);
  const [modal, setModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const courses = coursesState.data?.courses || [];
  const tasks = tasksState.data?.tasks || [];
  const loading = coursesState.loading || tasksState.loading;
  const error = coursesState.error || tasksState.error;

  async function refresh() {
    await Promise.all([coursesState.reload(), tasksState.reload()]);
  }

  async function saveTask(body) {
    setSubmitting(true);
    setFormError("");
    try {
      if (modal?.task) {
        await api.tasks.update(modal.task.id, body);
      } else {
        await api.tasks.create(body);
      }
      setModal(null);
      await refresh();
    } catch (err) {
      setFormError(err.message || "Could not save item.");
    } finally {
      setSubmitting(false);
    }
  }

  async function setStatus(task, status) {
    try {
      await api.tasks.setStatus(task.id, status);
      await refresh();
    } catch (err) {
      setFormError(err.message || "Could not update status.");
    }
  }

  async function removeTask(task) {
    if (!window.confirm(`Delete “${task.title}”?`)) return;
    try {
      await api.tasks.remove(task.id);
      await refresh();
    } catch (err) {
      setFormError(err.message || "Could not delete item.");
    }
  }

  return (
    <>
      <header className="page-header">
        <div>
          <h2>Assignments & exams</h2>
          <p>Track due dates, estimated effort, grading weight, status, and notes.</p>
        </div>
        <Button type="button" onClick={() => setModal({ task: null })} disabled={!courses.length}>
          Add item
        </Button>
      </header>
      <ErrorBanner message={error || formError} />
      {loading ? <LoadingState /> : null}
      {!loading && !tasks.length ? (
        <EmptyState label="No assignments or exams yet. Add one to populate the radar and recommendations." />
      ) : null}
      {!loading && tasks.length ? (
        <Card>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Course</th>
                  <th>Due</th>
                  <th>Effort</th>
                  <th>Weight</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => {
                  const course = courseById(courses, task.courseId);
                  return (
                    <tr key={task.id}>
                      <td>
                        <strong>{task.title}</strong>
                        <div className="meta">{task.type}{task.notes ? ` · ${task.notes}` : ""}</div>
                      </td>
                      <td>{course?.code || "—"}</td>
                      <td>{formatDue(task.dueDate)}</td>
                      <td>{task.estimatedHours}h</td>
                      <td>{task.weight}%</td>
                      <td>
                        <select
                          value={task.status}
                          onChange={(e) => setStatus(task, e.target.value)}
                          aria-label={`Status for ${task.title}`}
                        >
                          {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div className="actions">
                          <Button type="button" variant="secondary" onClick={() => setModal({ task })}>
                            Edit
                          </Button>
                          <Button type="button" variant="danger" onClick={() => removeTask(task)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
      {modal ? (
        <Modal
          title={modal.task ? "Edit assignment or exam" : "Add assignment or exam"}
          onClose={() => setModal(null)}
        >
          <TaskForm
            initial={modal.task || undefined}
            courses={courses}
            submitting={submitting}
            onCancel={() => setModal(null)}
            onSubmit={saveTask}
          />
        </Modal>
      ) : null}
    </>
  );
}

function emptyDays() {
  return Object.fromEntries(DAYS.map((day) => [day, { hours: 0, available: false }]));
}

function AvailabilityPage() {
  const { data, loading, error, reload } = useAsync(() => api.availability.get(), []);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [draft, setDraft] = useState(null);

  const form = useMemo(() => {
    if (draft) return draft;
    const availability = data?.availability;
    if (!availability) return null;
    return {
      weeklyHours: availability.weeklyHours,
      preferredStartHour: availability.preferredStartHour,
      preferredEndHour: availability.preferredEndHour,
      notes: availability.notes || "",
      days: { ...emptyDays(), ...(availability.days || {}) },
    };
  }, [draft, data]);

  function update(key, value) {
    setDraft((current) => {
      const base = current || form;
      return { ...base, [key]: value };
    });
  }

  function updateDay(day, patch) {
    setDraft((current) => {
      const base = current || form;
      const nextDay = { ...base.days[day], ...patch };
      if (patch.hours != null) {
        nextDay.available = Number(patch.hours) > 0;
      }
      return { ...base, days: { ...base.days, [day]: nextDay } };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    const weeklyHours = Number(form.weeklyHours);
    const preferredStartHour = Number(form.preferredStartHour);
    const preferredEndHour = Number(form.preferredEndHour);
    if (!weeklyHours || weeklyHours < 1 || weeklyHours > 80) {
      setFormError("Weekly study hours must be between 1 and 80.");
      return;
    }
    if (preferredEndHour <= preferredStartHour) {
      setFormError("Preferred end hour must be after start hour.");
      return;
    }
    setSubmitting(true);
    try {
      await api.availability.update({
        weeklyHours,
        preferredStartHour,
        preferredEndHour,
        notes: form.notes,
        days: Object.fromEntries(
          DAYS.map((day) => [
            day,
            {
              hours: Number(form.days[day]?.hours || 0),
              available: Number(form.days[day]?.hours || 0) > 0,
            },
          ])
        ),
      });
      setDraft(null);
      await reload();
    } catch (err) {
      setFormError(err.message || "Could not save availability.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <header className="page-header">
        <div>
          <h2>Study availability</h2>
          <p>Tell StudyPulse how many hours you actually have so recommendations stay realistic.</p>
        </div>
      </header>
      <ErrorBanner message={error || formError} />
      {loading || !form ? <LoadingState /> : null}
      {!loading && form ? (
        <Card>
          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="form-grid two">
              <FormField label="Weekly study hours">
                <input
                  type="number"
                  min="1"
                  max="80"
                  value={form.weeklyHours}
                  onChange={(e) => update("weeklyHours", e.target.value)}
                />
              </FormField>
              <FormField label="Preferred window">
                <div className="actions">
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={form.preferredStartHour}
                    onChange={(e) => update("preferredStartHour", e.target.value)}
                    aria-label="Preferred start hour"
                  />
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={form.preferredEndHour}
                    onChange={(e) => update("preferredEndHour", e.target.value)}
                    aria-label="Preferred end hour"
                  />
                </div>
              </FormField>
            </div>
            {DAYS.map((day) => (
              <div className="day-row" key={day}>
                <strong style={{ textTransform: "capitalize" }}>{day}</strong>
                <FormField label="Hours available">
                  <input
                    type="number"
                    min="0"
                    max="16"
                    step="0.5"
                    value={form.days[day]?.hours ?? 0}
                    onChange={(e) => updateDay(day, { hours: e.target.value })}
                    aria-label={`${day} hours available`}
                  />
                </FormField>
                <Badge level={Number(form.days[day]?.hours || 0) > 0 ? "low" : "neutral"}>
                  {Number(form.days[day]?.hours || 0) > 0 ? "open" : "off"}
                </Badge>
              </div>
            ))}
            <FormField label="Notes">
              <textarea
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
              />
            </FormField>
            <div className="actions">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving…" : "Save availability"}
              </Button>
            </div>
          </form>
        </Card>
      ) : null}
      <ResponsibleAiNotice />
    </>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/availability" element={<AvailabilityPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
