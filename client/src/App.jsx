import { Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // keep providers that are NOT routers
import NavBar from "./components/Navbar";
import "./assets/styles.css";

export default function App() {
  return (
    <AuthProvider>
      <header>
        <NavBar />
      </header>

      <main>
        <Outlet />
      </main>
      <footer>© School</footer>
    </AuthProvider>
  );
}
