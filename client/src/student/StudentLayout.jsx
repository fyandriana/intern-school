import { Outlet } from "react-router-dom";

export default function StudentLayout() {
  return (
    <div style={{ padding: 16 }}>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
