import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
    const { user, token, logout } = useAuth();
    const [ping, setPing] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Example: call a protected endpoint to verify token
    // useEffect(() => {
    //     let cancelled = false;
    //     async function fetchPing() {
    //         setError("");
    //         try {
    //             const res = await fetch("http://localhost:3001/api/protected/ping", {
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                     Authorization: `Bearer ${token}`,
    //                 },
    //             });
    //             if (!res.ok) throw new Error(`HTTP ${res.status}`);
    //             const data = await res.json();
    //             if (!cancelled) setPing(data);
    //         } catch (e) {
    //             if (!cancelled) setError(e+"Could not reach protected API");
    //         }
    //     }
    //     if (token) fetchPing();
    //     return () => {
    //         cancelled = true;
    //     };
    // }, [token]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div style={styles.wrap}>
            <header style={styles.header}>
                <h1 style={styles.title}>Dashboard</h1>
                <div>
                    <Link to="/login">Login</Link> · <Link to="/signup">Signup</Link>
                </div>
            </header>

            <section style={styles.card}>
                <h2 style={{ marginTop: 0 }}>Hello{user?.name ? `, ${user.name}` : ""} 👋</h2>
                <p>
                    {user?.email && <strong>{user.email}</strong>} {user?.role && <>· Role: <em>{user.role}</em></>}
                </p>

                <div style={styles.row}>
                    <button onClick={handleLogout} style={styles.button}>Log out</button>
                </div>

                <hr style={{ margin: "16px 0" }} />

                {/*<h3 style={{ marginTop: 0 }}>Protected API check</h3>*/}
                {/*{error && <p style={{ color: "#b91c1c" }}>{error}</p>}*/}
                {/*{ping ? (*/}
                {/*    <pre style={styles.pre}>{JSON.stringify(ping, null, 2)}</pre>*/}
                {/*) : (*/}
                {/*    !error && <p>Contacting API…</p>*/}
                {/*)}*/}

                {/* Role-based quick ideas */}
                {user?.role === "Teacher" && (
                    <div style={styles.panel}>
                        <h4 style={{ marginTop: 0 }}>Teacher shortcuts</h4>
                        <ul>
                            <li>Create a course</li>
                            <li>Add quiz to a course</li>
                            <li>View students progress</li>
                        </ul>
                    </div>
                )}

                {user?.role === "Student" && (
                    <div style={styles.panel}>
                        <h4 style={{ marginTop: 0 }}>Student shortcuts</h4>
                        <ul>
                            <li>View enrolled courses</li>
                            <li>Continue a quiz</li>
                            <li>See scores & status</li>
                        </ul>
                    </div>
                )}
            </section>
        </div>
    );
}

const styles = {
    wrap: { maxWidth: 800, margin: "40px auto", padding: "0 16px" },
    header: {
        marginBottom: 16,
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 12,
    },
    title: { margin: 0 },
    card: {
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
        background: "#fff",
    },
    row: { display: "flex", gap: 8, alignItems: "center" },
    button: {
        border: "1px solid #e5e7eb",
        background: "#f9fafb",
        padding: "8px 12px",
        borderRadius: 8,
        cursor: "pointer",
    },
    pre: {
        background: "#0b1020",
        color: "#e5e7eb",
        padding: 12,
        borderRadius: 8,
        overflowX: "auto",
    },
    panel: {
        marginTop: 16,
        padding: 12,
        borderRadius: 10,
        background: "#f8fafc",
        border: "1px solid #e5e7eb",
    },
};
