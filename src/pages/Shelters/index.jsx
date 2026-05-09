import React, { useState, useRef, useEffect } from 'react';
import { Table, Button, Typography, Tag, Modal, Form, Input, Select, Space, message, Card, InputNumber, Tooltip, AutoComplete, Row, Col, Switch, Descriptions, Progress } from 'antd';
import { PlusOutlined, DeleteOutlined, HomeOutlined, SearchOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useShelter } from '../../context/ShelterContext';
import { useAuth } from '../../context/AuthContext';

const { Title } = Typography;
const { Option } = Select;

const Shelters = () => {
    // Get shelter data and management functions from ShelterContext
    const { shelters, totalShelters, loading, fetchShelters, addShelter, updateShelterStatus, deleteShelter, updateShelter } = useShelter();
    const { user: currentUser } = useAuth();

    // Pagination and Filter State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        const load = async () => {
            await fetchShelters({
                Query: searchText,
                Page: currentPage,
                PageSize: pageSize
            });
        };

        const timeoutId = setTimeout(load, 500);
        return () => clearTimeout(timeoutId);
    }, [fetchShelters, searchText, currentPage, pageSize]);

    const handleTableChange = (pagination) => {
        setCurrentPage(pagination.current);
        setPageSize(pagination.pageSize);
    };

    // UI state for Modal visibility and Search functionality
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingShelter, setEditingShelter] = useState(null);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [viewingShelter, setViewingShelter] = useState(null);

    const [form] = Form.useForm();
    const [editForm] = Form.useForm();
    // Autocomplete state
    const [options, setOptions] = useState([]);
    const [searching, setSearching] = useState(false);
    const searchTimeout = useRef(null);

    const handleSearch = (value) => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        if (!value) {
            setOptions([]);
            return;
        }
        setSearching(true);
        searchTimeout.current = setTimeout(async () => {
            try {
                // Using Photon API for better fuzzy search
                const response = await axios.get(`https://photon.komoot.io/api/?q=${encodeURIComponent(value + ' Sri Lanka')}&limit=5`);
                const newOptions = response.data.features.map(item => {
                    const props = item.properties;
                    const coords = item.geometry.coordinates; // [lon, lat]
                    const label = [props.name, props.street, props.city, props.state].filter(Boolean).join(', ');
                    return {
                        value: label,
                        label: label,
                        lat: coords[1],
                        lon: coords[0]
                    };
                });
                setOptions(newOptions.filter(opt => opt.label)); // filter out empty labels
            } catch (error) {
                console.error("Error fetching locations:", error);
            } finally {
                setSearching(false);
            }
        }, 800);
    };

    const handleSelect = (value, option, targetForm) => {
        const lon = parseFloat(option.lon).toFixed(2);
        const lat = parseFloat(option.lat).toFixed(2);
        targetForm.setFieldsValue({
            locationName: value,
            location: `${lon}, ${lat}`
        });
    };

    // Handler to save a new shelter
    const handleAddShelter = async (values) => {
        const success = await addShelter(values);
        if (success) {
            setIsModalVisible(false);
            form.resetFields();
        }
    };

    const handleEditClick = (record) => {
        setEditingShelter(record);
        editForm.setFieldsValue(record);
        setIsEditModalVisible(true);
    };

    const handleEditSubmit = async (values) => {
        const success = await updateShelter(editingShelter.id, values);
        if (success) {
            message.success('Shelter updated successfully');
            setIsEditModalVisible(false);
            setEditingShelter(null);
        }
    };

    // Confirm deletion of a shelter
    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Are you sure delete this shelter?',
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            async onOk() {
                const success = await deleteShelter(id);
                if (success) {
                    message.success('Shelter deleted');
                }
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
            title: 'Shelter Name',
            dataIndex: 'name',
            key: 'name',
            filters: Array.from(new Set(shelters.map(s => s.name))).map(n => ({ text: n, value: n })),
            onFilter: (value, record) => record.name === value,
            filterSearch: true,
        },
        {
            title: 'Location Name',
            dataIndex: 'locationName',
            key: 'locationName',
        },
        {
            title: 'Occupancy',
            key: 'occupancy',
            width: 200,
            render: (_, record) => {
                const percent = Math.round((record.currentCount / record.maxCount) * 100);
                let status = 'normal';
                if (percent >= 90) status = 'exception';
                else if (percent >= 70) status = 'active';
                
                return (
                    <Space direction="vertical" style={{ width: '100%' }} size={0}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                            <span>{record.currentCount} / {record.maxCount}</span>
                            <span>{percent}%</span>
                        </div>
                        <Progress 
                            percent={percent} 
                            size="small" 
                            status={status}
                            strokeColor={percent >= 90 ? '#ff4d4f' : undefined}
                            showInfo={false}
                        />
                    </Space>
                );
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const isActive = status === 'Activate' || status === 'Active' || status === 'Available';
                return (
                    <Tag color={isActive ? "success" : "error"}>
                        {isActive ? "ACTIVATE" : "DEACTIVATE"}
                    </Tag>
                );
            },
        },
    ];

    columns.push({
        title: 'Action',
        key: 'action',
        render: (_, record) => {
            const isActive = record.status === 'Activate' || record.status === 'Active' || record.status === 'Available';
            const isAdmin = currentUser?.role !== 'User' && currentUser?.role !== 'user';
            return (
                <Space size="small">
                    <Tooltip title="View">
                        <Button
                            type="default"
                            size="small"
                            style={{ color: '#722ed1', borderColor: '#d3adf7', background: '#f9f0ff' }}
                            icon={<EyeOutlined />}
                            onClick={() => {
                                setViewingShelter(record);
                                setIsViewModalVisible(true);
                            }}
                        />
                    </Tooltip>
                    {isAdmin && (
                        <>
                            <Tooltip title="Edit">
                                <Button
                                    type="default"
                                    size="small"
                                    style={{ color: '#1890ff', borderColor: '#91d5ff', background: '#e6f7ff' }}
                                    icon={<EditOutlined />}
                                    onClick={() => handleEditClick(record)}
                                />
                            </Tooltip>
                            <Tooltip title={isActive ? "Deactivate" : "Activate"}>
                                <Switch
                                    size="small"
                                    checked={isActive}
                                    onChange={(checked) => updateShelterStatus(record.id, checked ? 'Activate' : 'Deactivate')}
                                />
                            </Tooltip>
                        </>
                    )}
                </Space>
            );
        },
    });

    return (
        <div style={{ padding: '24px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            {/* --- Header Section --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0 }}>Shelter Management</Title>
                
                <Space size="middle">
                    <Input.Search
                        placeholder="Search shelters..."
                        allowClear
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 350 }}
                    />
                    {/* Add Shelter Button */}
                    {currentUser?.role !== 'User' && currentUser?.role !== 'user' && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                            New Shelter
                        </Button>
                    )}
                </Space>
            </div>

            {/* --- Shelters Table --- */}
            <Card bordered={false} bodyStyle={{ padding: 0 }} style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
                <Table 
                    columns={columns} 
                    dataSource={shelters} 
                    rowKey="id" 
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: totalShelters,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} shelters`,
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 1000 }}
                />
            </Card>

            {/* --- Add New Shelter Modal --- */}
            <Modal
                title="Add New Shelter"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddShelter}
                >
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="name"
                                label="Shelter Name"
                                rules={[{ required: true, message: 'Please enter shelter name' }]}
                            >
                                <Input placeholder="City Community Center" prefix={<HomeOutlined />} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="locationName"
                                label="Location Name"
                                rules={[{ required: true, message: 'Please enter location name' }]}
                            >
                                <AutoComplete
                                    options={options}
                                    onSearch={handleSearch}
                                    onSelect={(val, opt) => handleSelect(val, opt, form)}
                                    placeholder="Search location (e.g. Colombo 07)"
                                    notFoundContent={searching ? "Searching..." : "No location found"}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="location"
                                label="Location"
                                rules={[{ required: true, message: 'Please enter location' }]}
                            >
                                <Input placeholder="Longitude, Latitude" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="currentCount"
                                label="Current Count"
                                initialValue={0}
                                dependencies={['maxCount']}
                                rules={[
                                    { required: true, message: 'Please enter current occupant count' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            const max = getFieldValue('maxCount');
                                            if (value === undefined || max === undefined || value <= max) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Current count cannot exceed maximum count'));
                                        },
                                    }),
                                ]}
                            >
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="maxCount"
                                label="Maximum Count"
                                rules={[{ required: true, message: 'Please enter max count' }]}
                            >
                                <InputNumber min={1} style={{ width: '100%' }} placeholder="150" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit">
                                Add Shelter
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* --- Edit Shelter Modal --- */}
            <Modal
                title="Update Shelter Details"
                open={isEditModalVisible}
                onCancel={() => {
                    setIsEditModalVisible(false);
                    setEditingShelter(null);
                }}
                footer={null}
                width={800}
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleEditSubmit}
                >
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name="name" label="Shelter Name" rules={[{ required: true, message: 'Please enter shelter name' }]}>
                                <Input prefix={<HomeOutlined />} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="locationName" label="Location Name" rules={[{ required: true, message: 'Please enter location name' }]}>
                                <AutoComplete
                                    options={options}
                                    onSearch={handleSearch}
                                    onSelect={(val, opt) => handleSelect(val, opt, editForm)}
                                    placeholder="Search location..."
                                    notFoundContent={searching ? "Searching..." : "No location found"}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="location" label="Location" rules={[{ required: true, message: 'Please enter location' }]}>
                                <Input placeholder="Longitude, Latitude" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item 
                                name="currentCount" 
                                label="Current Count" 
                                dependencies={['maxCount']}
                                rules={[
                                    { required: true, message: 'Please enter current occupant count' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            const max = getFieldValue('maxCount');
                                            if (value === undefined || max === undefined || value <= max) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Current count cannot exceed maximum count'));
                                        },
                                    }),
                                ]}
                            >
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="maxCount" label="Maximum Count" rules={[{ required: true, message: 'Please enter max count' }]}>
                                <InputNumber min={1} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setIsEditModalVisible(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit">Save Changes</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
            {/* --- View Shelter Details Modal --- */}
            <Modal
                title="Shelter Details"
                open={isViewModalVisible}
                onCancel={() => {
                    setIsViewModalVisible(false);
                    setViewingShelter(null);
                }}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                        Close
                    </Button>
                ]}
                width={700}
            >
                {viewingShelter && (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="ID">{viewingShelter.id}</Descriptions.Item>
                        <Descriptions.Item label="Shelter Name">{viewingShelter.name}</Descriptions.Item>
                        <Descriptions.Item label="Location Name">{viewingShelter.locationName}</Descriptions.Item>
                        <Descriptions.Item label="Coordinates (Lon, Lat)">{viewingShelter.location}</Descriptions.Item>
                        <Descriptions.Item label="Current Occupants">{viewingShelter.currentCount}</Descriptions.Item>
                        <Descriptions.Item label="Maximum Capacity">{viewingShelter.maxCount}</Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <Tag color={(viewingShelter.status === 'Activate' || viewingShelter.status === 'Active' || viewingShelter.status === 'Available') ? "success" : "error"}>
                                {(viewingShelter.status === 'Activate' || viewingShelter.status === 'Active' || viewingShelter.status === 'Available') ? "ACTIVATE" : "DEACTIVATE"}
                            </Tag>
                        </Descriptions.Item>
                        {viewingShelter.createdOn && (
                            <Descriptions.Item label="Created Date">
                                {new Date(viewingShelter.createdOn).toISOString().split('T')[0]}
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default Shelters;
