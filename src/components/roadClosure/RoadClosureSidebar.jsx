import React from 'react';
import { Card, List, Typography, Badge, Button, Checkbox, Space, Empty } from 'antd';
import { DeleteOutlined, EnvironmentOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

const RoadClosureSidebar = ({ 
    closures, 
    selectedIds, 
    onSelectChange, 
    onDelete, 
    onBulkDelete,
    onStatusUpdate,
    showTitle = true,
    asDrawer = false
}) => {
    const allSelected = closures.length > 0 && selectedIds.length === closures.length;
    const indeterminate = selectedIds.length > 0 && selectedIds.length < closures.length;

    const onSelectAllChange = (e) => {
        onSelectChange(e.target.checked ? closures.map(c => c.id) : []);
    };

    const toggleSelect = (id) => {
        const newSelected = selectedIds.includes(id) 
            ? selectedIds.filter(i => i !== id) 
            : [...selectedIds, id];
        onSelectChange(newSelected);
    };

    const containerStyle = asDrawer
        ? { height: '100%', overflowY: 'auto', boxShadow: 'none' }
        : { height: 'calc(100vh - 120px)', overflowY: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' };

    return (
        <Card 
            title={
                showTitle ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Active Closures</span>
                        <Badge count={closures.length} overflowCount={999} style={{ backgroundColor: '#D32F2F' }} />
                    </div>
                ) : null
            }
            bordered={false}
            style={containerStyle}
        >
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Checkbox 
                    indeterminate={indeterminate} 
                    onChange={onSelectAllChange} 
                    checked={allSelected}
                >
                    Select All
                </Checkbox>
                <Button 
                    danger 
                    icon={<DeleteOutlined />} 
                    disabled={selectedIds.length === 0}
                    onClick={onBulkDelete}
                >
                    Bulk Delete
                </Button>
            </div>

            <List
                dataSource={closures}
                locale={{ emptyText: <Empty description="No active road closures" /> }}
                renderItem={(item) => (
                    <List.Item 
                        style={{ 
                            padding: '12px', 
                            border: '1px solid #f0f0f0', 
                            borderRadius: '8px', 
                            marginBottom: '12px',
                            background: selectedIds.includes(item.id) ? '#fff1f0' : 'white',
                            transition: 'all 0.3s'
                        }}
                        actions={[
                            <Button 
                                type="text" 
                                danger 
                                icon={<DeleteOutlined />} 
                                onClick={() => onDelete(item.id)}
                            />
                        ]}
                    >
                        <List.Item.Meta
                            avatar={<Checkbox checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} />}
                            title={
                                <Space direction="vertical" size={0} style={{ width: '100%' }}>
                                    <Text strong style={{ fontSize: '15px' }}>{item.roadName}</Text>
                                    <Badge 
                                        status={item.status === 'blocked' ? 'error' : 'warning'} 
                                        text={item.status.toUpperCase()} 
                                    />
                                </Space>
                            }
                            description={
                                <Space direction="vertical" size={4} style={{ marginTop: 8 }}>
                                    <div><Text type="secondary" size="small"><EnvironmentOutlined /> {item.reason}</Text></div>
                                    <div><Text type="secondary" style={{ fontSize: '12px' }}><ClockCircleOutlined /> {new Date(item.blockedAt).toLocaleString()}</Text></div>
                                </Space>
                            }
                        />
                    </List.Item>
                )}
            />
        </Card>
    );
};

export default RoadClosureSidebar;