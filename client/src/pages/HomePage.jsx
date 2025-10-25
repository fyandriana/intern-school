import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Tile({ to, title, subtitle }) {
  return (
    <Link
      to={to}
      style={{
        display: "block",
        padding: 14,
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        textDecoration: "none",
        background: "#fff",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
      {subtitle && <div style={{ color: "#6b7280", fontSize: 14 }}>{subtitle}</div>}
    </Link>
  );
}

function RoleBadge({ role }) {
  if (!role) return null;
  return (
    <span
      style={{
        display: "inline-block",
        marginLeft: 8,
        padding: "2px 8px",
        borderRadius: 999,
        border: "1px solid #e5e7eb",
        background: "#f9fafb",
        fontSize: 12,
        color: "#374151",
      }}
    >
      {role}
    </span>
  );
}

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh", // full viewport height
        background: "#f3f4f6",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          padding: 50,
          background: "white",
          borderRadius: 12, // optional rounding
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)", // optional shadow
        }}
      >
        {/* Header */}
        <header>
          <h1 style={{ margin: 0, fontSize: 24, lineHeight: 1.2 }}>
            School Management
            <RoleBadge role={user?.role} />
          </h1>
        </header>

        {/* Auth / Greeting */}
        <section
          style={{
            padding: 14,
            borderRadius: 12,
            background: "#fcfcfd",
          }}
        >
          {user ? (
            <div>
              <div style={{ fontWeight: 600 }}>Welcome{user.name ? `, ${user.name}` : ""}! 👋</div>
              <div style={{ color: "#6b7280", marginTop: 4 }}>
                Use the quick links below to jump into your workspace.
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ color: "#374151", fontWeight: 600 }}>You’re not signed in.</div>
              <Link
                to="/login"
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  textDecoration: "none",
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  fontWeight: 600,
                }}
              >
                Log in
              </Link>
              <Link
                to="/signup"
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  textDecoration: "none",
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  fontWeight: 600,
                }}
              >
                Sign up
              </Link>
            </div>
          )}
        </section>

        {/* Quick Links */}
        <section>
          {/* Teacher quick links */}
          {user?.role === "teacher" && (
            <div
              style={{
                display: "grid",
                gap: 12,
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              }}
            >
              <Tile to="/teacher" title="All Courses" subtitle="Browse and manage all courses" />
              <Tile
                to="/teacher/my-courses"
                title="My Courses"
                subtitle="View and edit your courses"
              />
              <Tile to="/teacher/new" title="Create Course" subtitle="Add a new course" />
            </div>
          )}

          {/* Student quick links */}
          {user?.role === "student" && (
            <div
              style={{
                display: "grid",
                gap: 12,
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              }}
            >
              <Tile to="/courses" title="Browse Courses" subtitle="Find a course to enroll" />
              <Tile
                to="/me/progress"
                title="My Progress"
                subtitle="View your course status & scores"
              />
            </div>
          )}

          {/* Neutral (logged out) quick links */}
          {!user && (
            <div
              style={{
                display: "grid",
                gap: 12,
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              }}
            >
              <Tile to="/login" title="Teacher Portal" subtitle="Log in to manage courses" />
              <Tile to="/login" title="Student Portal" subtitle="Log in to view your progress" />
              <Tile to="/signup" title="Create an Account" subtitle="Get started in minutes" />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
