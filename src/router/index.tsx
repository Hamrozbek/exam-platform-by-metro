import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/auth/Login';
import Superadmindashboard from '../pages/admin/Superadmindashboard';

const AppRouter = () => {
    return (
        <Routes>
            {/* Ommaviy sahifalar */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<div className="p-10 text-center text-red-500 font-bold">Sizga ruxsat berilmagan!</div>} />

            {/* ADMIN Yo'nalishlari */}
            <Route>
                <Route path="/admin/dashboard" element={<Superadmindashboard/>} />
                {/* <Route path="/admin/exams" element={<AdminExams />} /> */}
            </Route>

            {/* MANAGER Yo'nalishlari */}
            <Route element={<ProtectedRoute allowedRoles={['MANAGER']} />}>
                {/* <Route path="/manager/results" element={<ManagerResults />} /> */}
            </Route>

            {/* USER (Xodim) Yo'nalishlari */}
            <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
                {/* <Route path="/user/welcome" element={<UserWelcome />} /> */}
                {/* <Route path="/user/quiz" element={<UserQuiz />} /> */}
            </Route>

            {/* Default yo'nalish */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRouter;