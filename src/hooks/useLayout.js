import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';

const useLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    
    const { logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const { notifications, unreadCount } = useNotification();

    const handleMenuClick = ({ key }) => {
        navigate(key);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return {
        collapsed,
        setCollapsed,
        navigate,
        location,
        isDarkMode,
        toggleTheme,
        notifications,
        unreadCount,
        handleMenuClick,
        handleLogout
    };
};

export default useLayout;
