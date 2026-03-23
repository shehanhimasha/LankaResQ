import React, { useState } from 'react';
import { Table, Button, Typography, Tag, Modal, Form, Input, Select, Space, message, Card, InputNumber } from 'antd';
import { PlusOutlined, DeleteOutlined, HomeOutlined, SearchOutlined } from '@ant-design/icons';
import { useShelter } from '../context/ShelterContext';

const { Title } = Typography;
const { Option } = Select;

const Shelters = () => {
    // Get shelter data and management functions from ShelterContext
    const { shelters, addShelter, updateShelterStatus, deleteShelter } = useShelter();

    // UI state for Modal visibility and Search functionality
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');

    const [form] = Form.useForm();

    // Handler to save a new shelter
    const handleAddShelter = (values) => {
        addShelter(values);
        message.success('Shelter added successfully');
        setIsModalVisible(false);
        form.resetFields();
    };

    // Filter shelters by Name or Location based on search text
    const filteredShelters = shelters.filter(shelter =>
        shelter.name.toLowerCase().includes(searchText.toLowerCase()) ||
        shelter.location.toLowerCase().includes(searchText.toLowerCase())
    );

    // Confirm deletion of a shelter
    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Are you sure delete this shelter?',
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                deleteShelter(id);
                message.success('Shelter deleted');
            },
        });
    };

    // Table Column Configuration
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
                // Dropdown to update shelter availability status
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

    return (
        <div>
            {/* --- Header Section --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Title level={2} style={{ margin: 0 }}>Shelter Management</Title>
                    {/* Search Input */}
                    <Input
                        placeholder="Search shelters..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 250 }}
                    />
                </div>
                {/* Add Shelter Button */}
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)} size="large">
                    Add New Shelter
                </Button>
            </div>

            {/* --- Shelters Table --- */}
            <Card bordered={false} style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <Table columns={columns} dataSource={filteredShelters} rowKey="id" />
            </Card>

            {/* --- Add New Shelter Modal --- */}
            <Modal
                title="Add New Shelter"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddShelter}
                >
                    <Form.Item
                        name="name"
                        label="Shelter Name"
                        rules={[{ required: true, message: 'Please enter shelter name' }]}
                    >
                        <Input placeholder="City Community Center" prefix={<HomeOutlined />} />
                    </Form.Item>

                    <Form.Item
                        name="location"
                        label="Location"
                        rules={[{ required: true, message: 'Please enter location' }]}
                    >
                        <Input placeholder="Colombo 07" />
                    </Form.Item>

                    <Form.Item
                        name="contactNumber"
                        label="Contact Number"
                        rules={[{ required: true, message: 'Please enter contact number' }]}
                    >
                        <Input placeholder="0112345678" />
                    </Form.Item>

                    <Form.Item
                        name="maxCapacity"
                        label="Maximum Capacity"
                        rules={[{ required: true, message: 'Please enter max capacity' }]}
                    >
                        <InputNumber min={1} style={{ width: '100%' }} placeholder="150" />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Initial Status"
                        initialValue="Available"
                        rules={[{ required: true, message: 'Please select status' }]}
                    >
                        <Select>
                            <Option value="Available">Available</Option>
                            <Option value="Full">Full</Option>
                            <Option value="Not Available">Not Available</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit">
                                Add Shelter
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Shelters;
