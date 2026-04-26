import React from 'react';
import { Dropdown, Space, Avatar, Typography } from 'antd';
import { SettingOutlined, LogoutOutlined, DownOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

const { Text } = Typography;

const UserDropdown = ({ navigate }) => {
    const { user, logout } = useAuth();

    const items = [
        {
            key: 'profile',
            label: 'Profile Settings',
            icon: <SettingOutlined />,
            onClick: () => navigate('/settings'),
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            label: 'Logout',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: () => {
                logout();
                navigate('/login');
            },
        },
    ];

    // Use firstName if available, otherwise split the full name
    const displayName = user?.firstName || user?.name?.split(' ')[0] || 'Admin';

    return (
        <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
            <Space style={{ cursor: 'pointer', padding: '0 8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: 8 }}>
                    <Text strong style={{ fontSize: '14px', lineHeight: '1.2' }}>Welcome, {displayName}</Text>
                    <Text type="secondary" style={{ fontSize: '11px', opacity: 0.8 }}>{user?.role || 'Administrator'}</Text>
                </div>
                <div style={{ position: 'relative' }}>
                    <Avatar 
                        size={40} 
                        icon={<UserOutlined />} 
                        src={user?.profileImage}
                        style={{ 
                            background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
                            border: '2px solid #fff',
                            boxShadow: '0 2px 10px rgba(255, 77, 79, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    />
                    <div style={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        right: 0, 
                        width: 10, 
                        height: 10, 
                        backgroundColor: '#52c41a', 
                        borderRadius: '50%', 
                        border: '2px solid #fff' 
                    }} />
                </div>
                <DownOutlined style={{ fontSize: '10px', color: '#8c8c8c' }} />
            </Space>
        </Dropdown>
    );
};

export default UserDropdown;
