import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

// Context to hold the authentication state
const AuthContext = createContext(null);

const normalizeUserRecord = (user) => {
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    return {
        ...user,
        id: user.id,
        name: fullName || user.name || user.email || 'Unknown',
        email: user.email || '',
        role: typeof user.role === 'object' ? user.role.name : user.role || 'User',
        status: user.status || (user.isSafe ? 'Active' : 'Inactive') || 'Active',
        contact: user.mobileNumber || user.contact || '',
        joinedDate: user.joinedDate || (user.createdOn ? new Date(user.createdOn).toISOString().split('T')[0] : ''),
    };
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [usersDb, setUsersDb] = useState([]);

    // Fetch users exclusively from backend API — no localStorage fallback
    const fetchRemoteUsers = async () => {
        try {
            const response = await api.get('/users', { params: { Page: 1, PageSize: 100 } });
            const items = response.data?.items ?? response.data ?? [];
            if (Array.isArray(items)) {
                const remoteUsers = items.map(normalizeUserRecord);
                setUsersDb(remoteUsers);
                return true;
            }
            console.error('GET /users returned unexpected data format');
            return false;
        } catch (error) {
            console.error('Failed to fetch users from backend:', error);
            return false;
        }
    };

    // Expose a refresh function to re-fetch users from backend on demand
    const refreshUsers = async () => {
        return await fetchRemoteUsers();
    };

    useEffect(() => {
        const init = async () => {
            // Restore logged-in user session from localStorage
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
            // Fetch users from backend (will silently fail if not authenticated yet)
            await fetchRemoteUsers();
            setLoading(false);
        };

        init();
    }, []);

    // Authenticate against backend API
    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', {
                userName: email,
                password: password,
            });

            const userData = response.data;

            // Check if user has an allowed role for the admin panel
            // LoginResponse returns roleId (int). Common mapping: 1=Admin, 2=SuperAdmin, 3=Co-Admin, 4=User
            // Also handle cases where role might be a string or object from other endpoints
            const allowedRoleIds = [1, 2, 3]; // Admin, Super Admin, Co-Admin
            const allowedRoleNames = ['admin', 'super admin', 'co-admin'];

            let isAllowed = false;
            if (userData.roleId != null) {
                isAllowed = allowedRoleIds.includes(userData.roleId);
            }
            if (!isAllowed && userData.role) {
                const roleName = typeof userData.role === 'object' ? userData.role.name : userData.role;
                isAllowed = allowedRoleNames.includes((roleName || '').toLowerCase());
            }

            if (!isAllowed) {
                throw new Error('Access denied. Only Admin, Super Admin, and Co-Admin users can log in.');
            }

            // Persist session (including token) in localStorage
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            // Now that we're authenticated, fetch the users list
            await fetchRemoteUsers();

            return userData;
        } catch (error) {
            // Re-throw custom errors (e.g. role check) without overwriting the message
            if (!error.response) throw error;
            const message =
                error.response?.data?.message ||
                error.response?.data?.title ||
                error.response?.data ||
                'Invalid email or password';
            throw new Error(typeof message === 'string' ? message : 'Login failed');
        }
    };

    const updateProfile = async (updatedData) => {
        try {
            // If user has an id, update via backend
            if (user?.id) {
                await api.put(`/users/${user.id}`, updatedData);
            }
            // Update local session data
            const sessionData = { ...user, ...updatedData };
            setUser(sessionData);
            localStorage.setItem('user', JSON.stringify(sessionData));

            // Refresh the users list from backend
            await fetchRemoteUsers();

            return sessionData;
        } catch (error) {
            console.error('Failed to update profile:', error);
            throw new Error(
                error.response?.data?.message ||
                error.response?.data?.title ||
                'Failed to update profile'
            );
        }
    };

    // Create a new user via backend API
    const addUser = async (newUserData) => {
        try {
            await api.post('/users', newUserData);
            await fetchRemoteUsers();
            return true;
        } catch (error) {
            console.error('Failed to add user:', error);
            throw new Error(
                error.response?.data?.message ||
                error.response?.data?.title ||
                'Failed to add user'
            );
        }
    };

    // Update a user via backend API
    const updateUserDb = async (id, updatedData) => {
        try {
            await api.put(`/users/${id}`, updatedData);
            await fetchRemoteUsers();
            return true;
        } catch (error) {
            console.error('Failed to update user:', error);
            throw new Error(
                error.response?.data?.message ||
                error.response?.data?.title ||
                'Failed to update user'
            );
        }
    };

    // Delete a user via backend API
    const deleteUserDb = async (id) => {
        try {
            await api.delete(`/users/${id}`);
            await fetchRemoteUsers();
            return true;
        } catch (error) {
            console.error('Failed to delete user:', error);
            throw new Error(
                error.response?.data?.message ||
                error.response?.data?.title ||
                'Failed to delete user'
            );
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateProfile, usersDb, addUser, updateUserDb, deleteUserDb, refreshUsers, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Custom hook to easily use the AuthContext
export const useAuth = () => useContext(AuthContext);
