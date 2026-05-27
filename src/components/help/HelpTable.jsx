import React from 'react';
import { Table, Tag, Button, Space, Tooltip, Select } from 'antd';
import { EyeOutlined, CheckOutlined, DeleteOutlined, BellOutlined } from '@ant-design/icons';

const { Option } = Select;

const HelpTable = ({ requests, searchQuery, handleView, handleComplete, showDeleteConfirm, updateRequestStatus }) => {
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Location',
            dataIndex: 'location',
            key: 'location',
            width: 250,
            render: (text) => (
                <div style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    wordBreak: 'break-word',
                    whiteSpace: 'normal'
                }}>
                    {text}
                </div>
            )
        },
        {
            title: 'Urgency Level',
            dataIndex: 'urgencyLevel',
            key: 'urgencyLevel',
            width: 120,
            filters: [
                { text: 'High', value: 'high' },
                { text: 'Medium', value: 'medium' },
                { text: 'Low', value: 'low' },
            ],
            onFilter: (value, record) => record.urgencyLevel === value,
            render: (urgency) => {
                let color = 'success';
                if (urgency === 'high') color = 'error';
                if (urgency === 'medium') color = 'warning';
                return <Tag color={color}>{urgency?.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Reminder',
            dataIndex: 'reminder',
            key: 'reminder',
            align: 'center',
            width: 100,
            render: (count) => (
                <Space>
                    <BellOutlined style={{ color: count > 0 ? '#faad14' : '#cf1322', fontSize: '16px' }} />
                    <span style={{ fontWeight: 'bold', fontSize: '14px', color: count > 0 ? '#000' : '#8c8c8c' }}>
                        {count || 0}
                    </span>
                </Space>
            ),
        },
        {
            title: 'Submitted At',
            dataIndex: 'timestamp',
            key: 'timestamp',
            width: 180,
            render: (ts) => ts ? new Date(ts).toLocaleString() : ''
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            filters: [
                { text: 'Pending', value: 'pending' },
                { text: 'Processing', value: 'processing' },
                { text: 'Completed', value: 'success' },
                { text: 'Delay', value: 'delay' },
            ],
            onFilter: (value, record) => {
                let status = record.status;
                if (status === 'active') status = 'pending';
                if (value === 'success') return status === 'success' || status === 'completed';
                return status === value;
            },
            render: (status, record) => {
                let currentStatus = status || 'pending';
                if (currentStatus === 'success') currentStatus = 'completed';
                if (currentStatus === 'active') currentStatus = 'pending';
                return (
                    <Select
                        value={currentStatus}
                        style={{ width: 130 }}
                        onChange={(value) => updateRequestStatus(record.id, value)}
                    >
                        <Option value="pending"><Tag color="warning">PENDING</Tag></Option>
                        <Option value="processing"><Tag color="processing">PROCESSING</Tag></Option>
                        <Option value="delay"><Tag color="error">DELAY</Tag></Option>
                        <Option value="completed"><Tag color="success">COMPLETED</Tag></Option>
                    </Select>
                );
            },
        },
        {
            title: 'Action',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="View Details">
                        <Button
                            type="default"
                            style={{ color: '#722ed1', borderColor: '#d3adf7', background: '#f9f0ff' }}
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => handleView(record)}
                        />
                    </Tooltip>

                    {record.status !== 'success' && record.status !== 'completed' && (
                        <Tooltip title="Mark as Completed">
                            <Button
                                type="default"
                                style={{ color: '#52c41a', borderColor: '#b7eb8f', background: '#f6ffed' }}
                                icon={<CheckOutlined />}
                                size="small"
                                onClick={() => handleComplete(record)}
                            />
                        </Tooltip>
                    )}

                    <Tooltip title="Delete Request">
                        <Button
                            type="default"
                            danger
                            style={{ color: '#ff4d4f', borderColor: '#ffa39e', background: '#fff1f0' }}
                            icon={<DeleteOutlined />}
                            size="small"
                            onClick={() => showDeleteConfirm(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const filteredData = [...(requests || [])].filter(req => {
        const q = (searchQuery || '').toLowerCase();
        return !q ||
            req.name?.toLowerCase().includes(q) ||
            req.id?.toString().toLowerCase().includes(q) ||
            req.location?.toLowerCase().includes(q) ||
            req.status?.toLowerCase().includes(q) ||
            req.urgencyLevel?.toLowerCase().includes(q);
    }).sort((a, b) => {
        const aStatus = a.status === 'active' ? 'pending' : a.status;
        const bStatus = b.status === 'active' ? 'pending' : b.status;
        const aCompleted = aStatus === 'success' || aStatus === 'completed';
        const bCompleted = bStatus === 'success' || bStatus === 'completed';
        
        // Put completed/success requests at the bottom
        if (aCompleted && !bCompleted) return 1;
        if (!aCompleted && bCompleted) return -1;
        
        // Sort by the latest event time (creation timestamp or last reminder) descending (newest first)
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const remindA = a.lastRemindedAt ? new Date(a.lastRemindedAt).getTime() : 0;
        const activeTimeA = Math.max(timeA, remindA);

        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        const remindB = b.lastRemindedAt ? new Date(b.lastRemindedAt).getTime() : 0;
        const activeTimeB = Math.max(timeB, remindB);

        return activeTimeB - activeTimeA;
    });

    return (
        <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 'max-content' }}
        />
    );
};

export default HelpTable;
