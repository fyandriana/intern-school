// src/context/AuthContext.jsx
import {createContext, useContext, useState, useEffect} from "react";

export const AuthContext = createContext(null);

export function AuthProvider({children}) {
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user"));
        } catch {
            return null;
        }
    });
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (user) localStorage.setItem("user", JSON.stringify(user)); else localStorage.removeItem("user");
    }, [user]);
    useEffect(() => {
        if (token) localStorage.setItem("token", token); else localStorage.removeItem("token");
    }, [token]);

    useEffect(() => {
        setReady(true);
    }, []);

    const login = (userData, jwt) => {
        setUser(userData);
        setToken(jwt ?? null);
    };
    const logout = () => {
        setUser(null);
        setToken("");
    };

    const isAuthed = !!user && !!token; // <-- expose this if you like

    return (
        <AuthContext.Provider value={{user, token, ready, isAuthed, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
