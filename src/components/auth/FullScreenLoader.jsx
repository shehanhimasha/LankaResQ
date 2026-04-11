import React from 'react';
import { Spin } from 'antd';

const FullScreenLoader = () => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Spin size="large" />
        </div>
    );
};

export default FullScreenLoader;
