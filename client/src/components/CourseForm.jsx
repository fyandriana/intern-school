import { useState } from "react";
import { Link } from "react-router-dom";

export default function CourseForm({
  initialValues = { title: "", description: "" },
  onSubmit,
  submitLabel = "Save",
}) {
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // tiny validation
    if (!values.title.trim() || !values.description.trim()) {
      setError("Both title and description are required.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form form-course">
      {error && <p className="form-error">{error}</p>}
      <div className="form__group">
        <label className="label" htmlFor="title">
          Title
        </label>
        <input
          name="title"
          value={values.title}
          onChange={handleChange}
          placeholder="Intro to Databases"
          required
        />
      </div>
      <div className="form__group">
        <label className="label" htmlFor="title">
          Description
        </label>
        <textarea
          name="description"
          value={values.description}
          onChange={handleChange}
          placeholder="Covers SQL basics, joins, transactions…"
          rows={15}
          required
        />
      </div>

      <Link to="/teacher/my-courses">
        <button>Back to list</button>
      </Link>
      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
