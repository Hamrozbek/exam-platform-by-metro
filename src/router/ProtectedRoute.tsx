import { Navigate, Outlet, useLocation } from 'react-router-dom';

interface Props {
    allowedRoles: string[]; 
}

const ProtectedRoute = ({ allowedRoles }: Props) => {
    const location = useLocation();

    const token = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('role');

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    if (!allowedRoles.includes(userRole || '')) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;