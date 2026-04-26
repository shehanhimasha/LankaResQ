import React from 'react';
import { Popup } from 'react-leaflet';
import { Typography, Space, Button } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

const BulkActionPopup = ({ bulkPopupPosition, selectedIds, handleBulkApprove, handleBulkReject }) => {
    if (!bulkPopupPosition || selectedIds.length === 0) return null;

    return (
        <Popup 
            position={bulkPopupPosition} 
            autoPan={false}
            closeButton={false}
        >
            <div style={{ textAlign: 'center', minWidth: 160 }}>
                <Title level={5} style={{ margin: '0 0 12px 0', color: '#1890ff' }}>
                    {selectedIds.length} Location{selectedIds.length > 1 ? 's' : ''} Selected
                </Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Button 
                        type="primary" 
                        block
                        icon={<CheckCircleOutlined />} 
                        style={{ backgroundColor: '#52c41a' }}
                        onClick={handleBulkApprove}
                    >
                        {selectedIds.length > 1 ? 'Approve Selected' : 'Approve'}
                    </Button>
                    <Button 
                        type="primary" 
                        danger 
                        block
                        icon={<CloseCircleOutlined />} 
                        onClick={handleBulkReject}
                    >
                        {selectedIds.length > 1 ? 'Reject Selected' : 'Reject'}
                    </Button>
                </Space>
            </div>
        </Popup>
    );
};

export default BulkActionPopup;
