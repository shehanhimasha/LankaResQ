import React, { useState } from 'react';
import { Layout, Menu, Button, theme, Avatar, Dropdown, Space } from 'antd';
import {
    HomeOutlined,
    AppstoreOutlined,
    QuestionCircleOutlined,
    TeamOutlined,
    AlertOutlined,
    UserOutlined,
    SettingOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    LogoutOutlined,
    SunOutlined,
    MoonOutlined,
    BellOutlined,
    WarningOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import logo from '../assets/temp_img.svg';
import { Badge } from 'antd'; // Ensure Badge is imported if not already in destructure (it wasn't)

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const { unreadCount } = useNotification();

    const menuItems = [
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
            icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,
            label: 'Danger Zone',
        },
        (user?.role === 'Admin' || user?.role === 'admin' || user?.role === 'Co-Admin' || user?.role === 'co-admin') && {
            key: '/users',
            icon: <UserOutlined />,
            label: 'Users',
        },
        {
            key: '/settings',
            icon: <SettingOutlined />,
            label: 'Settings',
        },
    ].filter(Boolean);

    const handleMenuClick = ({ key }) => {
        navigate(key);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed} breakpoint="lg" onBreakpoint={(broken) => {
                if (broken) setCollapsed(true);
            }}>
                <div className="demo-logo-vertical" style={{
                    height: 64,
                    margin: 0,
                    background: 'rgba(255, 255, 255, 0)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    padding: collapsed ? '0' : '0 24px',
                    overflow: 'hidden',
                    transition: 'all 0.2s'
                }}>
                    <img src={logo} alt="LankaResQ" style={{ height: 32, width: 'auto' }} />
                    {!collapsed && <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', marginLeft: 10, whiteSpace: 'nowrap' }}>LankaResQ</span>}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={handleMenuClick}
                />
            </Sider>
            <Layout>
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

                        <Dropdown
                            menu={{
                                items: [
                                    {
                                        key: '1',
                                        label: 'Profile',
                                        icon: <UserOutlined />,
                                        onClick: () => navigate('/settings'),
                                    },
                                    {
                                        key: 'notification',
                                        label: (
                                            <Space>
                                                Notifications
                                                {unreadCount > 0 && <Badge count={unreadCount} size="small" />}
                                            </Space>
                                        ),
                                        icon: <BellOutlined />,
                                        onClick: () => navigate('/alerts'),
                                    },
                                    {
                                        key: '2',
                                        label: 'Dashboard',
                                        icon: <AppstoreOutlined />,
                                        onClick: () => navigate('/'),
                                    },
                                ]
                            }}
                            placement="bottomRight"
                        >
                            <Space style={{ cursor: 'pointer' }}>
                                <Badge count={unreadCount > 0 ? unreadCount : 0}>
                                    <Avatar shape="square" icon={<UserOutlined />} style={{ backgroundColor: '#87d068' }} />
                                </Badge>
                            </Space>
                        </Dropdown>

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
