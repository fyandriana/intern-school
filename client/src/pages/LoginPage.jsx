import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const { token } = useAuth();
    const navigate = useNavigate();

    // If already logged in, send to dashboard
    useEffect(() => {
        if (token) navigate("/dashboard");
    }, [token, navigate]);

    return (
        <div style={styles.wrap}>
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
