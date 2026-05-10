import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    // Act as a pass-through adapter mapping directly to the unified Auth database
    const { usersDb: users, totalUsers, addUser, registerUser, updateUserDb: updateUser, deleteUserDb: deleteUser, refreshUsers } = useAuth();

    return (
        <UserContext.Provider value={{ users, totalUsers, addUser, registerUser, updateUser, deleteUser, refreshUsers }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
