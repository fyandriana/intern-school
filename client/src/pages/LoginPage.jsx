import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { user, token, ready } = useAuth(); // make sure context exposes these
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!ready) return; // wait for hydration
    if (!token || !user) return;
    const from = location.state?.from?.pathname;
    // role-based default
    const roleHome = user.role === "teacher" ? "/teacher" : "/me";

    const unsafe = ["/login", "/signup"].includes(from);
    const target = !from || unsafe ? roleHome : from;

    navigate(target, { replace: true });
  }, [ready, token, user, location.state, navigate]);

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
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <header style={styles.header}>
          <h1 style={styles.title}>Welcome back</h1>
          <p style={styles.sub}>
            New here? <Link to="/signup">Create an account</Link>
          </p>
        </header>

        <section style={styles.card}>
          <LoginForm />
        </section>
      </div>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 520, margin: "40px auto", padding: "0 16px", marginTop: 50 },
  header: { marginBottom: 16 },
  title: { margin: 0 },
  sub: { marginTop: 8, opacity: 0.8 },
  card: { border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, background: "#fff" },
};
