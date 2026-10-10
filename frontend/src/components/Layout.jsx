import { NavLink } from "react-router-dom";

export function Layout({ children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">SP</div>
          <div>
            <h1>StudyPulse AI</h1>
            <p>Academic Workload Copilot</p>
          </div>
        </div>
        <nav className="nav" aria-label="Primary navigation">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/courses">Courses</NavLink>
          <NavLink to="/tasks">Assignments & Exams</NavLink>
          <NavLink to="/availability">Study Availability</NavLink>
        </nav>
        <p className="sidebar-foot">
          Built for students juggling overlapping deadlines, limited hours, and scattered
          syllabi.
        </p>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
