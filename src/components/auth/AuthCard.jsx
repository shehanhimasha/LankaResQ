import React from 'react';
import { Card } from 'antd';
import logo from '../../assets/temp_img.svg';

const AuthCard = ({ children }) => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
            <Card style={{ width: 400, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <img src={logo} alt="LankaResQ Logo" style={{ height: 60, marginBottom: 16 }} />
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>LankaResQ Admin</h2>
                </div>
                {children}
            </Card>
        </div>
    );
};

export default AuthCard;
