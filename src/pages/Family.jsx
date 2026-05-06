import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

const Family = () => {
    return (
        <div style={{ padding: '24px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Title level={3}>Family</Title>
            <p>Manage family records.</p>
        </div>
    );
};

export default Family;
