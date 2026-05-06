import React from 'react';
import { Typography, List, Card, Button, Badge, Space, Empty, Modal } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNotification } from '../context/NotificationContext';

const { Title, Text } = Typography;

const Alerts = () => {
    const { notifications, markAsRead, markAllAsRead, clearAll, unreadCount } = useNotification();

    const confirmClearAll = () => {
        Modal.confirm({
            title: 'Are you sure you want to clear all notifications?',
            content: 'This action cannot be undone.',
            onOk: clearAll,
            okText: 'Yes',
            cancelText: 'No',
            okType: 'danger'
        });
    };

    return (
        <div style={{ padding: '24px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0 }}>System Alerts</Title>
                <Space>
                    {unreadCount > 0 && (
                        <Button icon={<CheckOutlined />} onClick={markAllAsRead}>
                            Mark All as Read
                        </Button>
                    )}
                    {notifications.length > 0 && (
                        <Button danger icon={<DeleteOutlined />} onClick={confirmClearAll}>
                            Clear All
                        </Button>
                    )}
                </Space>
            </div>

            <Card bordered={false} style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                {notifications.length === 0 ? (
                    <Empty description="No alerts or notifications at this time." image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                    <List
                        itemLayout="horizontal"
                        dataSource={notifications}
                        renderItem={item => (
                            <List.Item
                                actions={[
                                    !item.read && <Button type="link" size="small" onClick={() => markAsRead(item.id)}>Mark as Read</Button>
                                ]}
                                style={{ backgroundColor: item.read ? 'transparent' : '#f0f5ff', padding: '16px', borderRadius: '8px', marginBottom: '8px' }}
                            >
                                <List.Item.Meta
                                    avatar={<Badge dot={!item.read}><BellOutlined style={{ fontSize: '24px', color: item.read ? '#d9d9d9' : '#1890ff' }} /></Badge>}
                                    title={<Text strong={!item.read}>{item.title}</Text>}
                                    description={
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <Text>{item.message}</Text>
                                            <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px' }}>{item.date}</Text>
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                )}
            </Card>
        </div>
    );
};

export default Alerts;
