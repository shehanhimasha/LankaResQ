import React from 'react';
import { Typography, theme } from 'antd';

const { Title } = Typography;

const Family = () => {
    const { token: { colorBgContainer } } = theme.useToken();
    return (
        <div style={{ padding: '24px', background: colorBgContainer, borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Title level={3}>Family</Title>
            <p>Manage family records.</p>
        </div>
    );
};

export default Family;
