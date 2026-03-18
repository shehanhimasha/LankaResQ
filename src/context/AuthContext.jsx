import React, { createContext, useState, useEffect, useContext } from 'react';

// Context to hold the authentication state
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // State to hold current user information
    const [user, setUser] = useState(null);
    // State to manage loading status during initial check
    const [loading, setLoading] = useState(true);

    // Effect to check if a user is already logged in
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false); // Finished checking
    }, []);

    // Function to handle login
    const login = async (email, password) => {
        // Return a Promise to simulate an API call delay
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email === 'admin@gmail.com') {
                    const userData = {
                        email,
                        name: 'Admin User',
                        role: 'admin',
                        contact: '0771234567',
                        password: password
                    };

                    // Update state and persist to localStorage
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));

                    resolve(userData);
                } else {
                    reject(new Error('Invalid email or password'));
                }
            }, 500); // Simulate network delay
        });
    };

    // Function to update user profile details
    const updateProfile = async (updatedData) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Merge existing user data with updates
                const newUser = { ...user, ...updatedData };

                setUser(newUser);
                localStorage.setItem('user', JSON.stringify(newUser));

                resolve(newUser);
            }, 500);
        });
    };

    // Function to handle logout
    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        // Provide the auth state and functions to the rest of the app
        <AuthContext.Provider value={{ user, login, logout, updateProfile, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Custom hook to easily use the AuthContext
export const useAuth = () => useContext(AuthContext);
