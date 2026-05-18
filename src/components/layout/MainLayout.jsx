import React from 'react';
import { Layout, theme } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import HeaderBar from './HeaderBar';
import useLayout from '../../hooks/useLayout';

const { Content } = Layout;

const MainLayout = () => {
    const {
        collapsed,
        setCollapsed,
        navigate,
        location,
        isDarkMode,
        toggleTheme,
        notifications,
        unreadCount,
        handleMenuClick,
        handleLogout
    } = useLayout();

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar 
                collapsed={collapsed} 
                setCollapsed={setCollapsed} 
                location={location} 
                handleMenuClick={handleMenuClick} 
            />
            <Layout>
                <HeaderBar 
                    collapsed={collapsed} 
                    setCollapsed={setCollapsed} 
                    isDarkMode={isDarkMode} 
                    toggleTheme={toggleTheme} 
                    notifications={notifications}
                    unreadCount={unreadCount} 
                    navigate={navigate} 
                    handleLogout={handleLogout} 
                />
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
