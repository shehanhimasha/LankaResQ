import React from 'react';
import { Layout, Button, theme, Badge, Tooltip, Space } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SunOutlined,
    MoonOutlined,
    BellOutlined
} from '@ant-design/icons';
import UserDropdown from './UserDropdown';

const { Header } = Layout;

const HeaderBar = ({ 
    collapsed, 
    setCollapsed, 
    isDarkMode, 
    toggleTheme, 
    unreadCount, 
    navigate, 
    handleLogout 
}) => {
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    return (
        <Header style={{ 
            padding: '0 24px 0 0', 
            background: colorBgContainer, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            zIndex: 1000
        }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        fontSize: '16px',
                        width: 64,
                        height: 64,
                    }}
                />
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>LankaResQ Admin</h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Space size="large">
                    {/* 1. Notifications Icon (Now First) */}
                    <Tooltip title="Notifications">
                        <Badge count={unreadCount} offset={[0, 5]} size="small">
                            <Button
                                type="text"
                                shape="circle"
                                icon={<BellOutlined style={{ fontSize: '18px' }} />}
                                onClick={() => navigate('/notifications')}
                            />
                        </Badge>
                    </Tooltip>

                    {/* 2. Theme Toggle (Now Middle) */}
                    <Tooltip title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                        <Button
                            type="text"
                            shape="circle"
                            icon={isDarkMode ? <SunOutlined style={{ fontSize: '18px', color: '#faad14' }} /> : <MoonOutlined style={{ fontSize: '18px' }} />}
                            onClick={toggleTheme}
                        />
                    </Tooltip>
                </Space>

                <div style={{ width: '1px', height: '24px', background: '#f0f0f0', margin: '0 16px 0 8px' }} />

                {/* 3. User Welcome & Profile (Now at Far Right) */}
                <UserDropdown navigate={navigate} />
            </div>
        </Header>
    );
};

export default HeaderBar;
