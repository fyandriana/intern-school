import {useState, useRef, useEffect} from "react";
import {signup} from "../lib/api.js";
import { useNavigate } from "react-router-dom";

export default function SignupForm() {
    const [form, setForm] = useState({name: "", email: "", password: "", confirmPassword: "", role: "Student"});
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({type: "", text: ""});
    const [seconds, setSeconds] = useState(0);
    const navigate = useNavigate();

    const timerRef = useRef(null);
    const intervalRef = useRef(null);
    useEffect(() => () => {           // cleanup on unmount
        clearTimeout(timerRef.current);
        clearInterval(intervalRef.current);
    }, []);
    const onChange = (e) => setForm({...form, [e.target.name]: e.target.value});

    const validate = () => {
        if (!form.name.trim()) return {field: "name", text: "Name is required"};
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return {field: "email", text: "Valid email required"};
        if (form.password.length < 6) return {field: "password", text: "Password must be 6+ characters"};
        if (form.confirmPassword !== form.password) return {field: "confirmPassword", text: "Password doesn't match"};
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg({type: "", text: ""});

        const err = validate();
        if (err) {
            setMsg({type: "error", text: err.text});
            return;
        }

        setLoading(true);
        try {
            const res = await signup(form);
            setMsg({type: "success", text: `Welcome, ${res?.name ?? form.name}! Account created! Redirecting to login…`});
            setForm({name: "", email: "", password: "", confirmPassword: "", role: "Student"});

            setSeconds(5);

            // countdown
            intervalRef.current = setInterval(() => {
                setSeconds((s) => (s > 1 ? s - 1 : 0));
            }, 1000);

            // redirect after 5s
            timerRef.current = setTimeout(() => {
                navigate("/login", { replace: true, state: { justSignedUp: true, email: form.email } });
            }, 5000);
        } catch (e) {
            setMsg({type: "error", text: e.toString()});
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="form" onSubmit={handleSubmit} noValidate>
            {/*<div className="form__header">*/}
            {/*    <h2 className="form__title">Sign up</h2>*/}
            {/*    <p className="form__subtitle">Create an account to access courses and quizzes.</p>*/}
            {/*</div>*/}

            {msg.text && (
                <div className={`alert ${msg.type === "error" ? "alert--error" : "alert--success"}`}>
                    {msg.text} {seconds}
                </div>
            )}

            <div className="form__group">
                <label className="label" htmlFor="name">Full name</label>
                <input
                    id="name"
                    name="name"
                    className={`input ${msg.type === "error" && form.name.trim() === "" ? "is-invalid" : ""}`}
                    placeholder="Jane Doe"
                    value={form.name}
                    onChange={onChange}
                    autoComplete="name"
                />
            </div>

            <div className="form__group">
                <label className="label" htmlFor="email">Email</label>
                <input
                    id="email"
                    name="email"
                    className="input"
                    placeholder="jane@example.com"
                    value={form.email}
                    onChange={onChange}
                    autoComplete="email"
                    inputMode="email"
                />
            </div>

            <div className="form__group">
                <label className="label" htmlFor="password">Password</label>
                <div className="input-group">
                    <input
                        id="password"
                        name="password"
                        className="input"
                        type={showPw ? "text" : "password"}
                        placeholder="At least 6 characters"
                        value={form.password}
                        onChange={onChange}
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        className="input-group__btn"
                        onClick={() => setShowPw((s) => !s)}
                        aria-label={showPw ? "Hide password" : "Show password"}
                    >
                        {showPw ? "Hide" : "Show"}
                    </button>
                </div>
            </div>
            <div className="form__group">
                <label className="label" htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-group">
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        className="input"
                        type={showPw ? "text" : "password"}

                        value={form.confirmPassword}
                        onChange={onChange}
                    />
                    <button
                        type="button"
                        className="input-group__btn"
                        onClick={() => setShowPw((s) => !s)}
                        aria-label={showPw ? "Hide password" : "Show password"}
                    >
                        {showPw ? "Hide" : "Show"}
                    </button>
                </div>
            </div>
            <div className="form__group">
                <label className="label" htmlFor="role">Role</label>
                <select id="role" name="role" className="select" value={form.role} onChange={onChange}>
                    <option value="Student">Student</option>
                    <option value="Teacher">Teacher</option>
                </select>
            </div>
            <div className="form__group">
                <button className="btn btn--primary btn--block" type="submit" disabled={loading}>
                    {loading ? "Creating account…" : "Create account"}
                </button>
            </div>
            <div className="form__footer">

            </div>
        </form>
    );
}
