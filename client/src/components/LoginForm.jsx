import {useState, useRef, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import {login} from "../lib/api.js";
import {useAuth} from "../context/AuthContext";

export default function LoginForm() {
    const [form, setForm] = useState({email: "", password: ""});
    const [error, setError] = useState("");
    const {login: doLogin} = useAuth();
    const navigate = useNavigate();


    const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value});

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {

            const {token, user} = await login(form);
            doLogin(user, token);
            localStorage.setItem("user", JSON.stringify(user));

            navigate("/dashboard", { replace: true, state: { justSignedUp: true } });
        } catch {
            setError("Invalid credentials");
        }
    };

    return (
        <form className="form" onSubmit={handleSubmit}>
            <div className="input-group">
                <input name="email" onChange={handleChange} placeholder="Email"/>
            </div>
            <div className="input-group">
                <input name="password" type="password" onChange={handleChange} placeholder="Password"/>
            </div>
            <div className="input-group">
                <button type="submit" className="btn btn--primary btn--block">Login</button>
            </div>
            {error && <p>{error}</p>}
        </form>
    );
}
