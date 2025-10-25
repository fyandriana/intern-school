import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CourseForm from "../components/CourseForm";
import { getCourseById, updateCourse } from "../lib/api.js";
import { useAuth } from "../context/AuthContext";

export default function EditCoursePage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { token } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getCourseById(id, token);
        if (alive) setCourse(data);
      } catch (e) {
        if (alive) setErr(e.message || "Failed to load course");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, token]);

  if (loading) return <p>Loading…</p>;
  if (err) return <p className="form-error">{err}</p>;
  if (!course) return <p>Not found</p>;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16, background: "white" }}>
      <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
        <section style={styles.card}>
          <h1>Edit Course</h1>
          <CourseForm
            initialValues={{ title: course.title, description: course.description }}
            submitLabel="Save changes"
            onSubmit={async ({ title, description }) => {
              const updated = await updateCourse(course.id, { title, description }, token);
              nav(`/teacher/course/${updated.id}`);
            }}
          />
        </section>
      </div>
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
