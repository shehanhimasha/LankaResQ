import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const useAuthGuard = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    return {
        user,
        loading,
        location,
    };
};

export default useAuthGuard;
