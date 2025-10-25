import {useParams, Link} from "react-router-dom";

export default function StudentProfilePage() {
    const {studentId} = useParams();
    return (
        <div style={{maxWidth: 1100, margin: "0 auto", padding: 16, background: "white"}}>
            <h2>Student #{studentId}</h2>
            <p>Cross-course progress will appear here.</p>
            <p>Go to a course: <Link to="/teacher/courses/1">Demo Course</Link></p>
        </div>
    );
}
