import { Outlet } from "react-router-dom";

export default function TeacherLayout() {
  return (
    <div style={{ padding: 16 }}>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
