import React, { createContext, useState, useEffect, useContext } from 'react';

// Context to hold the authentication state
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [usersDb, setUsersDb] = useState([]);

    useEffect(() => {
        const storedUsers = localStorage.getItem('usersDb');
        if (storedUsers) {
            const parsed = JSON.parse(storedUsers).map(u => ({
                ...u,
                status: u.status || 'Active',
                role: u.role || 'User',
                joinedDate: u.joinedDate || new Date().toISOString().split('T')[0]
            }));
            setUsersDb(parsed);
            localStorage.setItem('usersDb', JSON.stringify(parsed));
        } else {
            const defaultUsers = [
                {
                    id: 1,
                    name: 'Admin User',
                    email: 'admin@gmail.com',
                    role: 'Admin',
                    password: '12345',
                    status: 'Active',
                    contact: '0771234567',
                    joinedDate: '2025-01-01',
                },
                {
                    id: 2,
                    name: 'Sarah Connor',
                    email: 'sarah@example.com',
                    role: 'Co-Admin',
                    password: 'password123',
                    status: 'Active',
                    joinedDate: '2025-02-15',
                }
            ];
            setUsersDb(defaultUsers);
            localStorage.setItem('usersDb', JSON.stringify(defaultUsers));
        }

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const foundUser = usersDb.find(u => u.email === email && u.password === password);
                if (foundUser) {
                    const userData = { ...foundUser };
                    delete userData.password;

                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                    resolve(userData);
                } else {
                    reject(new Error('Invalid email or password'));
                }
            }, 500);
        });
    };

    const updateProfile = async (updatedData) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const updatedUsersDb = usersDb.map(u => {
                    if (u.email === user.email) {
                        return { ...u, ...updatedData };
                    }
                    return u;
                });
                
                setUsersDb(updatedUsersDb);
                localStorage.setItem('usersDb', JSON.stringify(updatedUsersDb));

                const sessionData = { ...user, ...updatedData };
                delete sessionData.password;
                
                setUser(sessionData);
                localStorage.setItem('user', JSON.stringify(sessionData));

                resolve(sessionData);
            }, 500);
        });
    };

    const addUser = (newUserData) => {
        const newUser = { 
            ...newUserData, 
            id: usersDb.length ? Math.max(...usersDb.map(u => u.id)) + 1 : 1,
            status: 'Active',
            joinedDate: new Date().toISOString().split('T')[0]
        };
        const updatedUsers = [...usersDb, newUser];
        setUsersDb(updatedUsers);
        localStorage.setItem('usersDb', JSON.stringify(updatedUsers));
        return newUser;
    };

    const updateUserDb = (id, updatedData) => {
        const updatedUsers = usersDb.map(u => u.id === id ? { ...u, ...updatedData } : u);
        setUsersDb(updatedUsers);
        localStorage.setItem('usersDb', JSON.stringify(updatedUsers));
    };

    const deleteUserDb = (id) => {
        const updatedUsers = usersDb.filter(u => u.id !== id);
        setUsersDb(updatedUsers);
        localStorage.setItem('usersDb', JSON.stringify(updatedUsers));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateProfile, usersDb, addUser, updateUserDb, deleteUserDb, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Custom hook to easily use the AuthContext
export const useAuth = () => useContext(AuthContext);
