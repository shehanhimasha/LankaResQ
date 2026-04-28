import React from 'react';
import { Popup } from 'react-leaflet';
import { Typography, Space, Button } from 'antd';
import { CheckCircleOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

const BulkActionPopup = ({ bulkPopupPosition, selectedIds, dangerZones, handleBulkApprove, handleBulkReject }) => {
    if (!bulkPopupPosition || selectedIds.length === 0) return null;

    const selectedZones = dangerZones.filter(z => selectedIds.includes(z.id));
    const pendingCount = selectedZones.filter(z => z.status === 'pending').length;
    const approvedCount = selectedZones.filter(z => z.status === 'approved').length;

    return (
        <Popup 
            position={bulkPopupPosition} 
            autoPan={true}
            autoPanPadding={[50, 50]}
            closeButton={false}
        >
            <div style={{ textAlign: 'center', minWidth: 180 }}>
                <Title level={5} style={{ margin: '0 0 12px 0', color: '#1890ff', fontSize: '14px' }}>
                    {selectedIds.length} Selected ({pendingCount} Pending)
                </Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                    {pendingCount > 0 && (
                        <Button 
                            type="primary" 
                            block
                            icon={<CheckCircleOutlined />} 
                            style={{ backgroundColor: '#52c41a', border: 'none' }}
                            onClick={handleBulkApprove}
                        >
                            Approve {pendingCount > 1 ? 'Pending' : 'Report'}
                        </Button>
                    )}
                    <Button 
                        type="primary" 
                        danger 
                        block
                        icon={<DeleteOutlined />} 
                        onClick={handleBulkReject}
                    >
                        Delete {selectedIds.length > 1 ? 'Selected' : 'Report'}
                    </Button>
                </Space>
            </div>
        </Popup>
    );
};

export default BulkActionPopup;
