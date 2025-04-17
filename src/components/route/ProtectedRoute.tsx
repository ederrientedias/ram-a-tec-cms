import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContexts';

export const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Carregando...</div>; // Ou um spinner
    }

    return user ? <Outlet /> : <Navigate to="/" replace />;
};