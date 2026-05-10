import React from 'react';
import { Typography, Card, theme } from 'antd';

const { Title } = Typography;

const Settings = () => {
    const { token: { colorBgContainer } } = theme.useToken();
    return (
        <div style={{ padding: '24px', background: colorBgContainer, borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Title level={3} style={{ marginBottom: 24 }}>Settings</Title>
            <Card 
                bordered={false} 
                style={{ 
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                    minHeight: '400px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Typography.Text type="secondary" style={{ fontSize: '16px' }}>
                    System settings will go here.
                </Typography.Text>
            </Card>
        </div>
    );
};

export default Settings;
