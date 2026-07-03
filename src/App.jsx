import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./auth/Login";
import ProtectedRoute from "./auth/ProtectedRoute";

import AdminDashboard from './components/admin/AdminDashboard';
import TeacherDashboard from "./components/teacher/TeacherDashboard";
import StudentDashboard from "./components/student/StudentDashboard";
import AccountantDashboard from "./components/accountant/AccountantDashboard";
import LibrarianDashboard from "./components/librarian/LibrarianDashboard";


export default function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
        </Route>

        <Route
          path="/teacher"
          element={
            <ProtectedRoute roles={["teacher"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student"
          element={
            <ProtectedRoute roles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/accountant"
          element={
            <ProtectedRoute roles={["accountant"]}>
              <AccountantDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/librarian"
          element={
            <ProtectedRoute roles={["librarian"]}>
              <LibrarianDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
