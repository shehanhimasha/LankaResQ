import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';

// Context to hold the authentication state
const AuthContext = createContext(null);

const normalizeUserRecord = (user) => {
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    // Support various ID field names from backend
    const userId = user.id || user._id || user.userId || user.Id;
    
    return {
        ...user,
        id: userId,
        name: fullName || user.name || user.email || 'Unknown',
        email: user.email || '',
        role: typeof user.role === 'object' ? user.role.name : user.role || 'User',
        contact: user.mobileNumber || user.contact || '',
        joinedDate: user.joinedDate || (user.createdOn ? new Date(user.createdOn).toISOString().split('T')[0] : ''),
    };
};

const allowedRoleIds = new Set([1, 2, 3]);
const allowedRoleNames = new Set(['admin', 'super admin', 'co-admin']);

const isAllowedAdminRole = (userData) => {
    if (!userData) return false;

    if (userData.roleId != null) {
        return allowedRoleIds.has(userData.roleId);
    }

    if (userData.role) {
        const roleName = typeof userData.role === 'object' ? userData.role.name : userData.role;
        return allowedRoleNames.has((roleName || '').toLowerCase());
    }

    return false;
};

const getApiErrorMessage = (error, fallbackMessage) => {
    const message =
        error.response?.data?.message ||
        error.response?.data?.title ||
        error.response?.data ||
        fallbackMessage;

    return typeof message === 'string' ? message : fallbackMessage;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [usersDb, setUsersDb] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);

    // Fetch users exclusively from backend API
    const fetchRemoteUsers = async (params = {}) => {
        try {
            const { Query, RoleId, Page = 1, PageSize = 10 } = params;
            // Use the full URL as requested to ensure direct connection to the backend
            const response = await api.get('/users', {
                params: { Query, RoleId, Page, PageSize }
            });

            const data = response.data;
            // Handle both { items: [] } and [] formats
            const items = data?.items ?? (Array.isArray(data) ? data : []);

            if (Array.isArray(items)) {
                const remoteUsers = items.map(normalizeUserRecord);
                setUsersDb(remoteUsers);
                setTotalUsers(data?.total ?? items.length);
                return { items: remoteUsers, total: data?.total ?? items.length };
            }
            console.error('GET /users returned unexpected data format', data);
            return false;
        } catch (error) {
            console.error('Failed to fetch users from backend:', error);
            return false;
        }
    };

    // Expose a refresh function to re-fetch users from backend on demand
    const refreshUsers = async (params) => {
        return await fetchRemoteUsers(params);
    };

    const persistSession = async (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        await fetchRemoteUsers();
    };

    useEffect(() => {
        const init = async () => {
            // Restore logged-in user session from localStorage
            const storedUser = localStorage.getItem('user');
            const authToken = localStorage.getItem('authToken');

            let hasSessionToken = Boolean(authToken);
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    hasSessionToken = hasSessionToken || Boolean(parsedUser?.token || parsedUser?.accessToken);
                } catch {
                    localStorage.removeItem('user');
                }
            }

            // Avoid calling protected /users endpoint until a token is available.
            if (hasSessionToken) {
                await fetchRemoteUsers();
            }
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

            if (!isAllowedAdminRole(userData)) {
                throw new Error('Access denied. Only Admin and Super Admin users can log in.');
            }

            await persistSession(userData);

            return userData;
        } catch (error) {
            // Re-throw custom errors (e.g. role check) without overwriting the message
            if (!error.response) throw error;
            throw new Error(getApiErrorMessage(error, 'Login failed'));
        }
    };

    const googleLogin = async (idToken) => {
        try {
            const response = await api.post('/auth/google-login', { idToken });
            const userData = response.data;

            if (!isAllowedAdminRole(userData)) {
                throw new Error('Access denied. Only Admin and Super Admin users can log in.');
            }

            await persistSession(userData);
            return userData;
        } catch (error) {
            if (!error.response) throw error;
            throw new Error(getApiErrorMessage(error, 'Google login failed'));
        }
    };

    const googleRegister = async (idToken) => {
        try {
            const response = await api.post('/auth/google-register', { idToken });
            const userData = response.data;

            if (!isAllowedAdminRole(userData)) {
                throw new Error('Google account is registered, but this admin panel allows only Admin and Super Admin roles.');
            }

            await persistSession(userData);
            return userData;
        } catch (error) {
            if (!error.response) throw error;
            throw new Error(getApiErrorMessage(error, 'Google register failed'));
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

    // Register a new user with full details and profile picture (multipart/form-data)
    const registerUser = async (formData) => {
        try {
            await api.post('/users/register', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            await fetchRemoteUsers();
            return true;
        } catch (error) {
            console.error('Failed to register user:', error);
            throw new Error(
                error.response?.data?.message ||
                error.response?.data?.title ||
                'Failed to register user'
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

    const contextValue = useMemo(() => ({
        user,
        login,
        googleLogin,
        googleRegister,
        logout,
        updateProfile,
        usersDb,
        totalUsers,
        addUser,
        registerUser,
        updateUserDb,
        deleteUserDb,
        refreshUsers,
        loading,
    }), [
        user,
        usersDb,
        totalUsers,
        loading,
    ]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

// Custom hook to easily use the AuthContext
export const useAuth = () => useContext(AuthContext);
