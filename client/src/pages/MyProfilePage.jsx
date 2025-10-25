import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMe, updateMyName, changeMyPassword, mySummary, myCourses } from "../lib/api";
import { Link } from "react-router-dom";

export default function MyProfilePage() {
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState("summary"); // "account" | "summary"
  const [me, setMe] = useState(null);
  const [name, setName] = useState("");
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [sum, setSum] = useState(null);
  const [courses, setCourses] = useState({ items: [], total: 0, limit: 12, offset: 0 });

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const [meData, s, cs] = await Promise.all([
          getMe({ token, signal: ac.signal }),
          mySummary({ token, signal: ac.signal }),
          myCourses({ token, signal: ac.signal }),
        ]);
        setMe(meData);
        setName(meData.name);
        setSum(s);
        setCourses(cs);
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [token]);

  async function saveName(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const updated = await updateMyName({ token, name });
      setMe(updated);
      setMsg("Name updated.");
    } catch (e) {
      setMsg("Failed to update name.");
    } finally {
      setBusy(false);
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      if (pw.newPassword !== pw.confirm) throw new Error("Passwords do not match");
      if (pw.newPassword.length < 6) throw new Error("New password must be 6+ characters");
      await changeMyPassword({
        token,
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });
      setMsg("Password changed.");
      setPw({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (e) {
      setMsg(e.message || "Failed to change password.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (!me) return <div style={{ padding: 16 }}>Could not load your profile.</div>;

  const role = me.role;

  const LinkItem = ({ tab, children }) => (
    <button
      type="button"
      onClick={() => setActiveTab(tab)}
      aria-current={activeTab === tab ? "page" : undefined}
      style={{
        textAlign: "left",
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid",
        borderColor: activeTab === tab ? "#cfe3ff" : "#eee",
        background: activeTab === tab ? "#f5faff" : "#fff",
        fontWeight: activeTab === tab ? 600 : 500,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16, background: "white" }}>
      <header style={{ gridColumn: "1 / -1" }}>
        <h2 style={{ margin: 0 }}>My Profile</h2>
        <p style={{ color: "#666", marginTop: 6 }}>
          {me.email} • {role}
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* Sidebar */}
        <aside
          style={{
            position: "sticky",
            top: 16,
            alignSelf: "start",
            border: "1px solid #eee",
            borderRadius: 12,
            padding: 12,
            background: "#fff",
            display: "grid",
            gap: 8,
          }}
        >
          <h5 style={{ textAlign: "left" }}>{name}</h5>
          <LinkItem tab="summary">Summary</LinkItem>
          <LinkItem tab="account">Update profile</LinkItem>
        </aside>

        {/* Main */}
        <main style={{ display: "grid", gap: 20 }}>
          {msg && (
            <div
              aria-live="polite"
              style={{
                background: "#f0f7ff",
                border: "1px solid #cfe3ff",
                padding: 10,
                borderRadius: 10,
              }}
            >
              {msg}
            </div>
          )}

          {/* ACCOUNT TAB */}
          {activeTab === "account" && (
            <section aria-labelledby="account-heading" style={{ display: "grid", gap: 14 }}>
              <h3 id="account-heading" style={{ margin: 0 }}>
                Account
              </h3>

              <form onSubmit={saveName} style={{ display: "grid", gap: 10, maxWidth: 520 }}>
                <label>
                  <div style={{ marginBottom: 6, textAlign: "left" }}>Name</div>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid #ddd",
                      outline: "none",
                    }}
                  />
                </label>
                <div>
                  <button
                    disabled={busy || name.trim().length < 2}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid #cfe3ff",
                      background: "#f5faff",
                      cursor: "pointer",
                    }}
                  >
                    {busy ? "Saving…" : "Save name"}
                  </button>
                </div>
              </form>

              <form
                onSubmit={savePassword}
                style={{ display: "grid", gap: 10, maxWidth: 520, marginTop: 8 }}
              >
                <label>
                  <div style={{ marginBottom: 6, textAlign: "left" }}>Current password</div>
                  <input
                    type="password"
                    value={pw.currentPassword}
                    onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid #ddd",
                    }}
                  />
                </label>
                <label>
                  <div style={{ marginBottom: 6, textAlign: "left" }}>New password</div>
                  <input
                    type="password"
                    value={pw.newPassword}
                    onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid #ddd",
                    }}
                  />
                </label>
                <label>
                  <div style={{ marginBottom: 6, textAlign: "left" }}>Confirm new password</div>
                  <input
                    type="password"
                    value={pw.confirm}
                    onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid #ddd",
                    }}
                  />
                </label>
                <div>
                  <button
                    disabled={busy || pw.newPassword.length < 6 || pw.newPassword !== pw.confirm}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid #cfe3ff",
                      background: "#f5faff",
                      cursor: "pointer",
                    }}
                  >
                    {busy ? "Saving…" : "Change password"}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* SUMMARY TAB */}
          {activeTab === "summary" && (
            <section aria-labelledby="summary-heading" style={{ display: "grid", gap: 14 }}>
              <h3 id="summary-heading" style={{ margin: 0 }}>
                Summary
              </h3>
              {role === "Teacher" ? (
                <p>
                  You own <b>{sum?.ownedCount ?? 0}</b> course(s).
                </p>
              ) : (
                <p>
                  You're enrolled in <b>{sum?.enrolledCount ?? 0}</b> course(s).
                </p>
              )}

              <h3 style={{ margin: "6px 0 0 0", textAlign: "left" }}>My Courses</h3>
              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))",
                  gap: 14,
                }}
              >
                {courses.items.map((c) => (
                  <li
                    key={c.id}
                    style={{
                      border: "1px solid #eee",
                      borderRadius: 12,
                      padding: 12,
                      background: "#fff",
                    }}
                  >
                    <h4 style={{ margin: 0, fontSize: 16 }}>{c.title}</h4>
                    {role === "Student" && c.teacherName && (
                      <p style={{ margin: "6px 0 0 0", color: "#666" }}>by {c.teacherName}</p>
                    )}
                    <p
                      style={{
                        margin: "8px 0 0 0",
                        color: "#555",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        minHeight: 63,
                      }}
                    >
                      {c.description}
                    </p>
                    <div
                      style={{
                        marginTop: 10,
                        display: "flex",
                        gap: 8,
                        justifyContent: "flex-end",
                      }}
                    >
                      {role === "Student" && (
                        <Link to={`/student/courses/${c.id}`} className="btn">
                          View{" "}
                        </Link>
                      )}
                      {role === "Teacher" && (
                        <Link to={`/teacher/course/${c.id}`} className="btn">
                          View
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
