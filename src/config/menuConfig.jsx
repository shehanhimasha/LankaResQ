import React from 'react';
import {
    HomeOutlined,
    AppstoreOutlined,
    QuestionCircleOutlined,
    TeamOutlined,
    AlertOutlined,
    UserOutlined,
    SettingOutlined,
    WarningOutlined
} from '@ant-design/icons';

export const menuItems = [
    {
        key: '/',
        icon: <HomeOutlined />,
        label: 'Home',
    },
    {
        key: '/shelters',
        icon: <AppstoreOutlined />,
        label: 'Shelters',
    },
    {
        key: '/help',
        icon: <QuestionCircleOutlined />,
        label: 'Help',
    },
    {
        key: '/family',
        icon: <TeamOutlined />,
        label: 'Family',
    },
    {
        key: '/alerts',
        icon: <AlertOutlined />,
        label: 'Alerts',
    },
    {
        key: '/danger-zone',
        icon: <WarningOutlined />,
        label: 'Danger Zone',
    },
    {
        key: '/road-closure',
        icon: <WarningOutlined />, // Using WarningOutlined for now or I can find a better one
        label: 'Road Closure',
    },
    {
        key: '/users',
        icon: <UserOutlined />,
        label: 'Users',
    },
    {
        key: '/settings',
        icon: <SettingOutlined />,
        label: 'Settings',
    },
];
