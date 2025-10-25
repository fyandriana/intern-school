import { createBrowserRouter } from "react-router-dom";
import App from "./App.jsx";

// auth
import RequireTeacher from "./auth/RequireTeacher.jsx";
import { IndexGate, NotFound, RequireAuth } from "./auth/Guard.jsx";

// pages (top-level)

import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";

// teacher area
import TeacherLayout from "./teacher/TeacherLayout.jsx";
import TeacherCoursesPage from "./teacher/TeacherCoursesPage.jsx";
import CourseDetail from "./teacher/CourseDetail.jsx";
import CourseEdit from "./teacher/CourseEdit.jsx";
import CourseNew from "./teacher/CourseNew.jsx";
import QuizNew from "./teacher/QuizNew.jsx";
import QuizEditPage from "./teacher/QuizEdit.jsx";

import RequireStudent from "./auth/RequireStudent";
import StudentLayout from "./student/StudentLayout";
import StudentCoursesPage from "./student/StudentCoursesPages.jsx";
import MyCoursesPage from "./student/MyCoursesPage";
import CourseDetailPage from "./student/CourseDetailPage";
import QuizPage from "./student/QuizPage";
import MyProfilePage from "./pages/MyProfilePage.jsx";
import StudentsPage from "./teacher/StudentsPage.jsx";
import StudentDetailPage from "./teacher/StudentDetailPage.jsx";
import TakeQuizPage from "./student/TakeQuizzesPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // shared layout (NavBar, Outlet)
    errorElement: <NotFound />,
    children: [
      { index: true, element: <IndexGate /> },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },

      // all profile
      // Guard node that renders an <Outlet/>
      {
        element: <RequireAuth />, // <-- your guard returns <Outlet/>
        children: [
          { path: "me", element: <MyProfilePage /> }, // <-- now it renders inside the guard
        ],
      },
      // Teacher area (role-guarded)
      {
        path: "teacher",
        element: (
          <RequireTeacher>
            <TeacherLayout />
          </RequireTeacher>
        ),
        children: [
          { path: "my-courses", element: <TeacherCoursesPage mine /> }, // /teacher/my-courses
          { path: "course/:id", element: <CourseDetail /> },
          { path: "course/:id/edit", element: <CourseEdit /> },
          { path: "course/new", element: <CourseNew /> },
          { path: "course/:courseId/quiz/new", element: <QuizNew /> },
          { path: "course/:courseId/quiz/:quizId/edit/", element: <QuizEditPage /> },

          { path: "students", element: <StudentsPage /> },
          { path: "students/:studentId", element: <StudentDetailPage /> },
        ],
      },

      {
        path: "student",
        element: (
          <RequireStudent>
            <StudentLayout />
          </RequireStudent>
        ),
        children: [
          { index: true, element: <StudentCoursesPage /> },
          { path: "my-courses", element: <MyCoursesPage /> },
          { path: "courses/:courseId", element: <CourseDetailPage /> },
          { path: "courses/:courseId/quiz/:quizId", element: <QuizPage /> },
          { path: "courses/:courseId/quiz", element: <TakeQuizPage /> },
        ],
      },

      // 404 for anything else under "/"
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default router;
