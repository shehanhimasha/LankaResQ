import React from 'react';
import { Table, Button, Tag, Select } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

const SheltersTable = ({ shelters, filteredShelters, updateShelterStatus, handleDelete }) => {
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            filters: Array.from(new Set(shelters.map(s => s.name))).map(n => ({ text: n, value: n })),
            onFilter: (value, record) => record.name === value,
            filterSearch: true,
        },
        {
            title: 'Location',
            dataIndex: 'location',
            key: 'location',
            filters: Array.from(new Set(shelters.map(s => s.location))).map(l => ({ text: l, value: l })),
            onFilter: (value, record) => record.location === value,
            filterSearch: true,
        },
        {
            title: 'Contact Number',
            dataIndex: 'contactNumber',
            key: 'contactNumber',
        },
        {
            title: 'Max Capacity',
            dataIndex: 'maxCapacity',
            key: 'maxCapacity',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            filters: [
                { text: 'Available', value: 'Available' },
                { text: 'Full', value: 'Full' },
                { text: 'Not Available', value: 'Not Available' },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status, record) => (
                <Select
                    defaultValue={status}
                    style={{ width: 140 }}
                    onChange={(value) => updateShelterStatus(record.id, value)}
                >
                    <Option value="Available"><Tag color="success">AVAILABLE</Tag></Option>
                    <Option value="Full"><Tag color="warning">FULL</Tag></Option>
                    <Option value="Not Available"><Tag color="error">NOT AVAILABLE</Tag></Option>
                </Select>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(record.id)}
                >
                    Delete
                </Button>
            ),
        },
    ];

    return <Table columns={columns} dataSource={filteredShelters} rowKey="id" />;
};

export default SheltersTable;
