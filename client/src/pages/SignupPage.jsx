import { Link } from "react-router-dom";
import SignupForm from "../components/SignupForm";

export default function SignupPage() {
    return (
        <div style={styles.wrap}>
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
    );
}

const styles = {
    wrap: { maxWidth: 520, margin: "40px auto", padding: "0 16px" },
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
