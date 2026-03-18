import React, { createContext, useState, useContext } from 'react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([
        { id: 1, title: 'New Help Request', message: 'A new high urgency request has been submitted.', date: '2 mins ago', read: false },
        { id: 2, title: 'Shelter Update', message: 'City Community Center continues to be full.', date: '1 hour ago', read: false },
        { id: 3, title: 'System Alert', message: 'Backup completed successfully.', date: '1 day ago', read: true },
        { id: 4, title: 'New User Registered', message: 'John Doe has registered as a volunteer.', date: '2 days ago', read: true },
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, clearAll }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
