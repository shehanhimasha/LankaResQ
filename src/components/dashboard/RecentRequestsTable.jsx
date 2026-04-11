import React from 'react';
import { Card, Table, Tag, Select } from 'antd';

const { Option } = Select;

const RecentRequestsTable = ({ sortedRequests, updateRequestStatus }) => {
    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        {
            title: 'Type',
            dataIndex: 'emergencyType',
            key: 'emergencyType',
            filters: [
                { text: 'Medical', value: 'medical' },
                { text: 'Fire', value: 'fire' },
                { text: 'Flood', value: 'flood' },
                { text: 'Rescue', value: 'rescue' },
            ],
            onFilter: (value, record) => record.emergencyType?.includes(value),
            render: (types) => (
                <>{types.map(type => <Tag color="cyan" key={type}>{type.toUpperCase()}</Tag>)}</>
            ),
        },
        {
            title: 'Urgency',
            dataIndex: 'urgencyLevel',
            key: 'urgencyLevel',
            filters: [
                { text: 'High', value: 'high' },
                { text: 'Medium', value: 'medium' },
                { text: 'Low', value: 'low' },
            ],
            onFilter: (value, record) => record.urgencyLevel === value,
            render: (urgency) => {
                let color = urgency === 'high' ? 'red' : urgency === 'medium' ? 'orange' : 'green';
                return <Tag color={color}>{urgency.toUpperCase()}</Tag>;
            },
        },
        { title: 'People', dataIndex: 'numberOfPeople', key: 'numberOfPeople' },
        { title: 'Location', dataIndex: 'location', key: 'location' },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            filters: [
                { text: 'Pending', value: 'pending' },
                { text: 'Processing', value: 'processing' },
                { text: 'Success', value: 'success' },
                { text: 'Delay', value: 'delay' },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status, record) => (
                <Select
                    defaultValue={status}
                    style={{ width: 120 }}
                    onChange={(value) => updateRequestStatus(record.id, value)}
                >
                    <Option value="pending"><Tag color="orange">PENDING</Tag></Option>
                    <Option value="processing"><Tag color="blue">PROCESSING</Tag></Option>
                    <Option value="delay"><Tag color="red">DELAY</Tag></Option>
                    <Option value="success"><Tag color="green">SUCCESS</Tag></Option>
                </Select>
            ),
        }
    ];

    return (
        <Card title="Recent Requests" bordered={false} style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <Table
                dataSource={sortedRequests}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                scroll={{ x: true }}
            />
        </Card>
    );
};

export default RecentRequestsTable;
