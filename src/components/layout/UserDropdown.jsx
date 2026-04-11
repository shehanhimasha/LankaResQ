import React from 'react';
import { Dropdown, Space, Badge, Avatar } from 'antd';
import { UserOutlined, BellOutlined, AppstoreOutlined } from '@ant-design/icons';

const UserDropdown = ({ unreadCount, navigate }) => {
    return (
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
                        onClick: () => navigate('/notifications'),
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
                <Badge count={unreadCount} dot>
                    <Avatar shape="square" icon={<UserOutlined />} style={{ backgroundColor: '#87d068' }} />
                </Badge>
            </Space>
        </Dropdown>
    );
};

export default UserDropdown;
