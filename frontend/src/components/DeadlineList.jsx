import { dueIn, formatDue } from "../utils/format";
import { Badge } from "./Badge";
import { EmptyState } from "./Status";

export function DeadlineList({ tasks, courses = [] }) {
  if (!tasks?.length) {
    return <EmptyState label="No upcoming deadlines in this window." />;
  }
  const courseMap = Object.fromEntries(courses.map((c) => [c.id, c]));
  return (
    <div className="list">
      {tasks.map((task) => {
        const course = courseMap[task.courseId];
        return (
          <article className="list-item" key={task.id}>
            <div>
              <h4>{task.title}</h4>
              <div className="meta">
                <span
                  className="course-chip"
                  style={{ background: course?.color || "#1B6B93" }}
                />{" "}
                {course?.code || "Course"} · {task.type} · {task.estimatedHours}h · {task.weight}%
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <Badge level={new Date(task.dueDate) < new Date() ? "high" : "neutral"}>
                {dueIn(task.dueDate)}
              </Badge>
              <div className="meta">{formatDue(task.dueDate)}</div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
