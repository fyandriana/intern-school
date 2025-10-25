import { useNavigate } from "react-router-dom";
import CourseForm from "../components/CourseForm";
import { createCourse } from "../lib/api.js";
import { useAuth } from "../context/AuthContext";

export default function NewCoursePage() {
  const nav = useNavigate();
  const { user, token } = useAuth(); // user.id is the teacherId

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16, background: "white" }}>
      <h1>New Course</h1>
      <div style={styles.wrap}>
        <section style={styles.card}>
          <CourseForm
            initialValues={{ title: "", description: "" }}
            submitLabel="Create"
            onSubmit={async ({ title, description }) => {
              const created = await createCourse({ teacherId: user.id, title, description }, token);
              nav(`/teacher/course/${created.id}`); // go to detail
            }}
          />
        </section>
      </div>
    </div>
  );
}
const styles = {
  wrap: { maxWidth: 900, margin: "40px auto", padding: "0 16px" },
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
