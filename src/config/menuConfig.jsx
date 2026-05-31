import React from 'react';
import {
    HomeOutlined,
    AppstoreOutlined,
    QuestionCircleOutlined,
    AlertOutlined,
    UserOutlined,
    SettingOutlined,
    WarningOutlined,
    StopOutlined
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
        icon: <StopOutlined />,
        label: 'Road Closure',
    },
    {
        key: '/users',
        icon: <UserOutlined />,
        label: 'Users',
    },
];
