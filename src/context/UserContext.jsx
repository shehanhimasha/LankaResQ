import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    // Mock Users Data
    const [users, setUsers] = useState([
        {
            id: 1,
            name: 'Admin User',
            email: 'admin@lankaresq.com',
            role: 'Admin',
            status: 'Active',
            joinedDate: '2025-01-01',
        },
        {
            id: 2,
            name: 'Sarah Connor',
            email: 'sarah@example.com',
            role: 'Co-Admin',
            status: 'Active',
            joinedDate: '2025-02-15',
        },
        {
            id: 3,
            name: 'John Doe',
            email: 'john@example.com',
            role: 'User',
            status: 'Inactive',
            joinedDate: '2025-03-10',
        },
    ]);

    const addUser = (newUser) => {
        const user = {
            ...newUser,
            id: users.length + 1,
            status: 'Active', // Default status
            joinedDate: new Date().toISOString().split('T')[0],
        };
        setUsers([...users, user]);
    };

    const updateUser = (id, updatedData) => {
        setUsers(users.map(user => user.id === id ? { ...user, ...updatedData } : user));
    };

    const deleteUser = (id) => {
        setUsers(users.filter(user => user.id !== id));
    };

    return (
        <UserContext.Provider value={{ users, addUser, updateUser, deleteUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
