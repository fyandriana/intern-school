import {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import {listQuizzesForCourse, updateEnrollment} from "../lib/api";

export default function QuizPage() {
    const {courseId, quizId} = useParams();
    const {token} = useAuth();
    const nav = useNavigate();

    const [quiz, setQuiz] = useState(null);
    const [answer, setAnswer] = useState("");
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const ctrl = new AbortController();
        (async () => {
            const items = await listQuizzesForCourse({courseId: Number(courseId), token, signal: ctrl.signal});
            const q = items.find(x => Number(x.id) === Number(quizId));
            setQuiz(q || null);
        })();
        return () => ctrl.abort();
    }, [courseId, quizId, token]);

    if (!quiz) return <div>Loading quiz…</div>;

    async function onSubmit(e) {
        e.preventDefault();
        setSubmitted(true);
        const score = answer === quiz.correctAnswer ? 100 : 0;
        try {
            await updateEnrollment({
                courseId: Number(courseId),
                token,
                body: {status: "completed", score},
            });
        } catch (err) {
            console.error(err);
        }
    }

    const correct = submitted && answer === quiz.correctAnswer;

    return (
        <div>
            <button onClick={() => nav(-1)}>&larr; Back</button>
            <h2>Quiz</h2>
            <p style={{fontWeight: 600}}>{quiz.question}</p>

            <form onSubmit={onSubmit}>
                <div style={{display: "grid", gap: 8, margin: "12px 0"}}>
                    {quiz.options.map((opt, i) => (
                        <label key={i} style={{display: "flex", alignItems: "center", gap: 8}}>
                            <input
                                type="radio"
                                name="answer"
                                value={opt}
                                checked={answer === opt}
                                onChange={e => setAnswer(e.target.value)}
                                required
                            />
                            <span>{opt}</span>
                        </label>
                    ))}
                </div>
                <button type="submit">Submit</button>
            </form>

            {submitted && (
                <div style={{marginTop: 12}}>
                    {correct ? <strong>✅ Correct!</strong> : <strong>❌ Incorrect.</strong>}
                    {!correct && <div>Correct answer: <em>{quiz.correctAnswer}</em></div>}
                </div>
            )}
        </div>
    );
}
