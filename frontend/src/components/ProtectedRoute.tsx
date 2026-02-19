import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
    children: React.ReactElement;
    allowedRoles?: string[]; // e.g. ["admin"]
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (!token) {
        // Not logged in at all
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && (!role || !allowedRoles.includes(role))) {
        // Logged in but not allowed
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
