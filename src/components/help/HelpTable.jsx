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
        },
        {
            title: 'Urgency Level',
            dataIndex: 'urgencyLevel',
            key: 'urgencyLevel',
            filters: [
                { text: 'High', value: 'high' },
                { text: 'Medium', value: 'medium' },
                { text: 'Low', value: 'low' },
            ],
            onFilter: (value, record) => record.urgencyLevel === value,
            render: (urgency) => {
                let color = 'green';
                if (urgency === 'high') color = 'red';
                if (urgency === 'medium') color = 'orange';
                return <Tag color={color}>{urgency?.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Reminder',
            dataIndex: 'reminder',
            key: 'reminder',
            align: 'center',
            render: (count) => (
                <Space>
                    <BellOutlined style={{ color: count > 0 ? '#faad14' : '#cf1322', fontSize: '18px' }} />
                    <span style={{ fontWeight: 'bold', fontSize: '16px', color: count > 0 ? '#000' : '#8c8c8c' }}>
                        {count || 0}
                    </span>
                </Space>
            ),
        },
        {
            title: 'Submitted At',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (ts) => ts ? new Date(ts).toLocaleString() : ''
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
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
                let color = 'blue';
                if (status === 'pending') color = 'orange';
                if (status === 'completed' || status === 'success') color = 'green';
                if (status === 'delay') color = 'red';
                return <Tag color={color}>{status?.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="View Details">
                        <Button
                            type="default"
                            style={{ color: '#1890ff', borderColor: '#91d5ff', background: '#e6f7ff' }}
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
                            style={{ color: '#f5222d', borderColor: '#ffa39e', background: '#fff1f0' }}
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
        return 0;
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
