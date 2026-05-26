import React from 'react';
import { Table, Tag, Button, Space, Tooltip } from 'antd';
import { EyeOutlined, CheckOutlined, DeleteOutlined, BellOutlined } from '@ant-design/icons';

const HelpTable = ({ requests, searchQuery, handleView, handleComplete, showDeleteConfirm }) => {
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
            width: 120,
            filters: [
                { text: 'Pending', value: 'pending' },
                { text: 'Processing', value: 'processing' },
                { text: 'Completed', value: 'success' },
                { text: 'Delay', value: 'delay' },
            ],
            onFilter: (value, record) => {
                if (value === 'success') return record.status === 'success' || record.status === 'completed';
                return record.status === value;
            },
            render: (status) => {
                let color = 'processing';
                if (status === 'pending') color = 'warning';
                if (status === 'completed' || status === 'success') color = 'success';
                if (status === 'delay') color = 'error';
                return <Tag color={color}>{status?.toUpperCase()}</Tag>;
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
        const aCompleted = a.status === 'success' || a.status === 'completed';
        const bCompleted = b.status === 'success' || b.status === 'completed';
        if (aCompleted && !bCompleted) return 1;
        if (!aCompleted && bCompleted) return -1;
        
        // If both have same completion status, sort by newest first
        const dateA = new Date(a.timestamp || 0);
        const dateB = new Date(b.timestamp || 0);
        return dateB - dateA;
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
