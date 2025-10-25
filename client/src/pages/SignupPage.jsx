import { Link } from "react-router-dom";
import SignupForm from "../components/SignupForm";

export default function SignupPage() {
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
          <h1 style={styles.title}>Create your account</h1>
          <p style={styles.sub}>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </header>

        <section style={styles.card}>
          <SignupForm />
        </section>
      </div>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 1100, margin: "0 auto", padding: 25, background: "white", marginTop: 50 },
  header: { marginBottom: 16 },
  title: { margin: 0 },
  sub: { marginTop: 8, opacity: 0.8 },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 16,
    background: "#fff",
  },
};
