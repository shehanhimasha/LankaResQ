import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';
import Login from '../pages/Login';
import Home from '../pages/Home';
import Shelters from '../pages/Shelters';
import Help from '../pages/Help';
import Family from '../pages/Family';
import Alerts from '../pages/Alerts';
import Users from '../pages/Users';
import Settings from '../pages/Settings';
import DangerZone from '../pages/DangerZone';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route path="/" element={<Home />} />
                <Route path="/shelters" element={<Shelters />} />
                <Route path="/help" element={<Help />} />
                <Route path="/family" element={<Family />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/danger-zone" element={<DangerZone />} />
                <Route path="/users" element={<Users />} />
                <Route path="/settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
