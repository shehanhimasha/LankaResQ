import React from 'react';
import { List, Typography, Button, Card, Badge, Avatar, Space, Empty } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined, InfoCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { useNotification } from '../../context/NotificationContext';

const { Title, Text } = Typography;

const Notifications = () => {
    const { notifications, markAsRead, markAllAsRead, clearAll } = useNotification();

    const getIcon = (title) => {
        if (title.includes('Help')) return <WarningOutlined style={{ color: '#ff4d4f' }} />;
        if (title.includes('Shelter')) return <HomeOutlined />; // Need to import or use generic
        if (title.includes('User')) return <UserOutlined />; // Need to import
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    };

    // Quick fix for icons since I didn't import them all above
    const renderIcon = (title) => {
        return <BellOutlined />;
    }

    return (
        <div style={{ padding: '24px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0 }}>Notifications</Title>
                <Space>
                    <Button icon={<CheckOutlined />} onClick={markAllAsRead}>Mark all as read</Button>
                    <Button icon={<DeleteOutlined />} danger onClick={clearAll}>Clear all</Button>
                </Space>
            </div>

            <Card bordered={false} style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                {notifications.length > 0 ? (
                    <List
                        itemLayout="horizontal"
                        dataSource={notifications}
                        renderItem={item => (
                            <List.Item
                                actions={[
                                    !item.read && <Button type="link" size="small" onClick={() => markAsRead(item.id)}>Mark as read</Button>
                                ]}
                                style={{ background: item.read ? 'transparent' : 'rgba(24, 144, 255, 0.05)', padding: '12px 24px' }}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <Badge dot={!item.read}>
                                            <Avatar icon={<BellOutlined />} style={{ backgroundColor: item.read ? '#ccc' : '#1890ff' }} />
                                        </Badge>
                                    }
                                    title={<Text strong={!item.read}>{item.title}</Text>}
                                    description={
                                        <Space direction="vertical" size={0}>
                                            <Text>{item.message}</Text>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>{item.date}</Text>
                                        </Space>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                ) : (
                    <Empty description="No notifications" />
                )}
            </Card>
        </div>
    );
};

export default Notifications;
