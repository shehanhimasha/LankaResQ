import React from 'react';
import { Layout, Button, theme, Badge, Tooltip, Space, Popover, List, Typography } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SunOutlined,
    MoonOutlined,
    BellOutlined
} from '@ant-design/icons';
import UserDropdown from './UserDropdown';

const { Header } = Layout;
const { Text } = Typography;

const HeaderBar = ({ 
    collapsed, 
    setCollapsed, 
    isDarkMode, 
    toggleTheme, 
    notifications,
    unreadCount, 
    navigate, 
    handleLogout 
}) => {
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const notificationContent = (
        <div style={{ width: 320, maxHeight: 400, overflowY: 'auto', padding: '8px 0' }}>
            {notifications && notifications.length > 0 ? (
                <List
                    itemLayout="horizontal"
                    dataSource={notifications.slice(0, 5)} // Show up to 5 recent notifications
                    renderItem={item => (
                        <List.Item style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', background: item.read ? 'transparent' : '#f0f5ff' }}>
                            <List.Item.Meta
                                title={<span style={{ fontWeight: item.read ? 'normal' : '600', fontSize: '14px' }}>{item.title}</span>}
                                description={
                                    <Space direction="vertical" size={2} style={{ width: '100%' }}>
                                        <Text style={{ fontSize: '13px', color: '#595959' }}>{item.message}</Text>
                                        <Text type="secondary" style={{ fontSize: '11px' }}>{item.date}</Text>
                                    </Space>
                                }
                            />
                        </List.Item>
                    )}
                />
            ) : (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: '#999' }}>No notifications</div>
            )}
            <div style={{ textAlign: 'center', padding: '12px 16px 0 16px', borderTop: notifications && notifications.length > 0 ? '1px solid #f0f0f0' : 'none' }}>
                <Button type="link" onClick={() => navigate('/notifications')} style={{ padding: 0 }}>View All Notifications</Button>
            </div>
        </div>
    );

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
                    <Popover 
                        content={notificationContent} 
                        title={<div style={{ padding: '8px 16px', borderBottom: '1px solid #f0f0f0', fontWeight: 'bold' }}>Notifications</div>} 
                        trigger="hover" 
                        placement="bottomRight"
                        overlayInnerStyle={{ padding: 0 }}
                    >
                        <Badge count={unreadCount} offset={[0, 5]} size="small">
                            <Button
                                type="text"
                                shape="circle"
                                icon={<BellOutlined style={{ fontSize: '18px' }} />}
                                onClick={() => navigate('/notifications')}
                            />
                        </Badge>
                    </Popover>

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
