// AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
    });
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [ready, setReady] = useState(false);

    useEffect(() => {
        // keep user in storage
        if (user) localStorage.setItem("user", JSON.stringify(user));
        else localStorage.removeItem("user");
    }, [user]);

    useEffect(() => {
        // keep token in storage
        if (token) localStorage.setItem("token", token);
        else localStorage.removeItem("token");
    }, [token]);

    useEffect(() => { setReady(true); }, []); // hydration complete

    const login = (userData, jwt = null) => {
        setUser(userData);
        console.log(jwt);
        setToken(jwt);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, ready, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
