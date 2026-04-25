import React from 'react';
import { Layout, Button, theme } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    LogoutOutlined,
    SunOutlined,
    MoonOutlined
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
        <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 24 }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>LankaResQ Admin</h2>

                <UserDropdown unreadCount={unreadCount} navigate={navigate} />

                <Button
                    type="text"
                    shape="circle"
                    icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
                    onClick={toggleTheme}
                    title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                />

                <Button
                    type="primary"
                    danger
                    shape="circle"
                    size="small"
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                    title="Logout"
                />
            </div>
        </Header>
    );
};

export default HeaderBar;
