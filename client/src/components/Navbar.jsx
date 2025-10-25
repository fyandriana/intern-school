import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RoleLink({ to, allow, children, className }) {
  // allow: "Teacher" | "Student" | ["Teacher","Student"]
  const { user } = useAuth();
  const ok = !!user && (Array.isArray(allow) ? allow.includes(user.role) : user.role === allow);
  if (!ok) return null;
  return (
    <NavLink to={to} className={({ isActive }) => `${className ?? ""} ${isActive ? "active" : ""}`}>
      {children}
    </NavLink>
  );
}

export default function NavBar() {
  const { user, token, ready, logout } = useAuth();
  const isAuthed = !!(user || token);
  if (!ready) return null;

  return (
    <>
      {isAuthed && (
        <nav className="nav" style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {/* ===== Teacher area ===== */}
          <RoleLink to="/courses">All Courses</RoleLink>
          <RoleLink to="/teacher/my-courses" allow="Teacher">
            My Courses
          </RoleLink>
          <RoleLink to="/teacher/course/new" allow="Teacher">
            Create Course
          </RoleLink>
          {/* Optional (only if you have this page) */}
          <RoleLink to="/teacher/students" allow="Teacher">
            Students
          </RoleLink>

          {/* ===== Student area ===== */}
          <RoleLink to="/student" allow="Student">
            All Courses
          </RoleLink>
          <RoleLink to="/student/my-courses" allow="Student">
            My Courses
          </RoleLink>

          {/* Right side */}
          <div
            style={{ marginLeft: "auto", display: "inline-flex", gap: 12, alignItems: "center" }}
          >
            <span>Hello {user?.name}!</span>
            <Link to="/me">My Profile</Link>
            <button onClick={logout}>Logout</button>
          </div>
        </nav>
      )}
    </>
  );
}
