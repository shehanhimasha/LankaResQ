import React, { useState } from 'react';
import { Table, Tag, Button, Space, Typography, Tooltip, message, Popconfirm, Badge, Modal, Row, Col, Divider, Input, Form, Select, InputNumber } from 'antd';
import { 
    EyeOutlined, 
    CheckOutlined, 
    DeleteOutlined, 
    BellOutlined,
    PlusOutlined
} from '@ant-design/icons';
import { useRequest } from '../context/RequestContext';

const { Title } = Typography;
const { Option } = Select;

const Help = () => {
    const { requests, updateRequestStatus, updateRequest, deleteRequest, addRequest } = useRequest();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [feedbackText, setFeedbackText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [form] = Form.useForm();

    const handleCreateSubmit = (values) => {
        const newRequest = {
            name: values.name,
            emergencyType: values.emergencyType,
            urgencyLevel: values.urgencyLevel,
            numberOfPeople: values.numberOfPeople,
            moreDetails: values.description || '',
            contactNumber: values.contactNo,
            location: values.location,
            reminder: 0,
        };
        addRequest(newRequest);
        message.success('New help request created manually!');
        setIsCreateModalOpen(false);
        form.resetFields();
    };

    const handleCreateCancel = () => {
        setIsCreateModalOpen(false);
        form.resetFields();
    };

    // Handlers for the Action buttons
    const handleView = (record) => {
        let updatedRecord = { ...record };
        
        if (!updatedRecord.logs) {
            updatedRecord.logs = [];
        }
        
        updatedRecord.logs.push({
            action: 'Viewed Request',
            time: new Date().toLocaleString(),
            adminName: 'System Admin'
        });
        
        updateRequest(updatedRecord);
        
        setSelectedRequest(updatedRecord);
        setFeedbackText(updatedRecord.feedback || '');
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        if (selectedRequest && !selectedRequest.feedback) {
            message.warning('Feedback is compulsory upon first view.');
            return;
        }
        setIsModalOpen(false);
        setTimeout(() => {
            setSelectedRequest(null);
            setFeedbackText('');
        }, 300);
    };

    const handleFeedbackSubmit = () => {
        if (!feedbackText.trim()) {
            message.error('Please enter feedback.');
            return;
        }
        
        const isFirstSubmit = !selectedRequest.feedback;
        const isFeedbackChanged = selectedRequest.feedback !== feedbackText;
        
        const updatedRecord = {
            ...selectedRequest,
            feedback: feedbackText,
            status: isFirstSubmit ? 'processing' : selectedRequest.status,
        };

        if (!updatedRecord.logs) {
            updatedRecord.logs = [];
        }

        if (isFirstSubmit || isFeedbackChanged) {
            updatedRecord.logs.push({
                action: isFirstSubmit ? 'Submitted Feedback' : 'Updated Feedback',
                time: new Date().toLocaleString(),
                adminName: 'System Admin'
            });
        }
        
        updateRequest(updatedRecord);
        setSelectedRequest(updatedRecord);
        message.success(isFirstSubmit ? 'Feedback submitted successfully!' : 'Feedback updated successfully!');

        if (isFirstSubmit || isFeedbackChanged) {
            setIsModalOpen(false);
            setTimeout(() => {
                setSelectedRequest(null);
                setFeedbackText('');
            }, 300);
        }
    };

    const handleComplete = (record) => {
        updateRequestStatus(record.id, 'success');
        message.success(`Request ${record.id} marked as completed.`);
    };

    const handleDelete = (record) => {
        deleteRequest(record.id);
        message.success(`Request ${record.id} permanently deleted.`);
    };

    const showDeleteConfirm = (record) => {
        Modal.confirm({
            title: 'Delete Help Request',
            content: `Are you sure you want to permanently delete the request from ${record.name} (${record.id})?`,
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            centered: true,
            onOk() {
                handleDelete(record);
            },
        });
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            fontWeight: 'bold',
            render: (text) => <b>{text}</b>,
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
            render: (urgency) => {
                let color = 'green';
                if (urgency === 'high') color = 'red';
                if (urgency === 'medium') color = 'orange';
                return <Tag color={color}>{urgency.toUpperCase()}</Tag>;
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
                        {count}
                    </span>
                </Space>
            ),
        },
        {
            title: 'Submitted At',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (ts) => new Date(ts).toLocaleString()
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'blue';
                if (status === 'pending') color = 'orange';
                if (status === 'completed' || status === 'success') color = 'green';
                if (status === 'delay') color = 'red';
                return <Tag color={color}>{status.toUpperCase()}</Tag>;
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
                    
                    {record.status !== 'success' && (
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

    return (
        <div style={{ padding: '24px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Title level={3} style={{ margin: 0 }}>Help Requests</Title>
                <Space size="middle">
                    <Input.Search 
                        placeholder="Search by ID, Name, Location or Status" 
                        allowClear 
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: 350 }} 
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>
                        New Request
                    </Button>
                </Space>
            </div>
            <Table 
                columns={columns} 
                dataSource={[...requests].filter(req => {
                    const q = searchQuery.toLowerCase();
                    return !q || 
                           req.name?.toLowerCase().includes(q) || 
                           req.id?.toString().toLowerCase().includes(q) || 
                           req.location?.toLowerCase().includes(q) || 
                           req.status?.toLowerCase().includes(q) ||
                           req.urgencyLevel?.toLowerCase().includes(q);
                }).sort((a, b) => {
                    if (a.status === 'success' && b.status !== 'success') return 1;
                    if (a.status !== 'success' && b.status === 'success') return -1;
                    return 0;
                })} 
                rowKey="id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 'max-content' }}
            />

            <Modal
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '24px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>{selectedRequest?.name}</span>
                        <span style={{ fontSize: '14px', color: '#888', fontWeight: 'normal' }}>{selectedRequest?.id}</span>
                    </div>
                }
                open={isModalOpen}
                onCancel={handleModalClose}
                maskClosable={!!selectedRequest?.feedback}
                closable={!!selectedRequest?.feedback}
                footer={[
                    <Button 
                        key="close" 
                        onClick={handleModalClose}
                        disabled={selectedRequest && !selectedRequest.feedback}
                    >
                        Close
                    </Button>
                ]}
                width={600}
                centered
            >
                {selectedRequest && (
                    <div style={{ marginTop: '24px', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
                        <Row gutter={[24, 24]}>
                            {/* Left Column */}
                            <Col xs={24} sm={12}>
                                <div style={{ marginBottom: '16px' }}>
                                    <Typography.Text type="secondary" style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Type of Emergency</Typography.Text>
                                    <Typography.Text strong style={{ fontSize: '15px' }}>{Array.isArray(selectedRequest.emergencyType) ? selectedRequest.emergencyType.join(', ').toUpperCase() : selectedRequest.emergencyType}</Typography.Text>
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <Typography.Text type="secondary" style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Contact No</Typography.Text>
                                    <Typography.Text strong style={{ fontSize: '15px' }}>{selectedRequest.contactNumber}</Typography.Text>
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <Typography.Text type="secondary" style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Location</Typography.Text>
                                    <Typography.Text strong style={{ fontSize: '15px' }}>{selectedRequest.location}</Typography.Text>
                                </div>
                            </Col>

                            {/* Right Column */}
                            <Col xs={24} sm={12}>
                                <div style={{ marginBottom: '16px' }}>
                                    <Typography.Text type="secondary" style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Urgency Level</Typography.Text>
                                    <Tag color={selectedRequest.urgencyLevel === 'high' ? 'red' : selectedRequest.urgencyLevel === 'medium' ? 'orange' : 'green'} style={{ margin: 0 }}>
                                        {selectedRequest.urgencyLevel?.toUpperCase()}
                                    </Tag>
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <Typography.Text type="secondary" style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>No. of People</Typography.Text>
                                    <Typography.Text strong style={{ fontSize: '15px' }}>{selectedRequest.numberOfPeople}</Typography.Text>
                                </div>
                                <div style={{ marginBottom: '16px' }}>
                                    <Typography.Text type="secondary" style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Submitted At</Typography.Text>
                                    <Typography.Text strong style={{ fontSize: '15px' }}>{new Date(selectedRequest.timestamp).toLocaleString()}</Typography.Text>
                                </div>
                            </Col>
                        </Row>

                        <div style={{ marginTop: '8px', marginBottom: '16px' }}>
                            <Typography.Text type="secondary" style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Description</Typography.Text>
                            <Typography.Text strong style={{ fontSize: '15px' }}>{selectedRequest.moreDetails || 'No description provided.'}</Typography.Text>
                        </div>
                    </div>
                )}

                {selectedRequest && (
                    <div style={{ marginTop: '24px' }}>
                        <Divider style={{ margin: '16px 0' }} />
                        <Typography.Title level={5} style={{ margin: '0 0 16px 0', color: '#1890ff' }}>Office Use</Typography.Title>
                        
                        <div>
                            <Typography.Text type="secondary" style={{ display: 'block', fontSize: '13px', marginBottom: '8px', fontWeight: 500 }}>
                                Admin Feedback / Progress Notes {!selectedRequest.feedback && <span style={{color: 'red'}}>*</span>}
                            </Typography.Text>
                            <Input.TextArea 
                                rows={4} 
                                value={feedbackText}
                                onChange={(e) => setFeedbackText(e.target.value)}
                                placeholder="Enter internal feedback, status updates, or actions taken here..." 
                                style={{ borderRadius: '6px' }}
                            />
                            <div style={{ marginTop: '12px', textAlign: 'right' }}>
                                <Button 
                                    type="primary" 
                                    onClick={handleFeedbackSubmit}
                                    disabled={!selectedRequest.feedback && !feedbackText.trim()}
                                >
                                    {selectedRequest.feedback ? 'Update' : 'Submit'}
                                </Button>
                            </div>
                        </div>

                        {selectedRequest.logs && (
                            <div style={{ marginTop: '24px' }}>
                                <Typography.Text type="secondary" style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}>Action Log</Typography.Text>
                                <div style={{ 
                                    maxHeight: '120px', 
                                    overflowY: 'auto', 
                                    padding: '8px 12px', 
                                    background: '#fafafa', 
                                    border: '1px solid #f0f0f0', 
                                    borderRadius: '6px' 
                                }}>
                                    {[...selectedRequest.logs].reverse().map((log, index) => (
                                        <div key={index} style={{ fontSize: '12px', marginBottom: '6px', borderBottom: index < selectedRequest.logs.length - 1 ? '1px dashed #e8e8e8' : 'none', paddingBottom: '4px' }}>
                                            <span style={{ color: '#888', marginRight: '8px' }}>[{log.time}]</span> 
                                            <span style={{ fontWeight: 500, marginRight: '4px' }}>{log.adminName}:</span> 
                                            <span>{log.action}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Create New Request Modal */}
            <Modal
                title={
                    <div style={{ paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
                        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Create New Help Request</span>
                    </div>
                }
                open={isCreateModalOpen}
                onCancel={handleCreateCancel}
                footer={null}
                centered
                width={600}
            >
                <Form layout="vertical" form={form} onFinish={handleCreateSubmit} style={{ marginTop: '24px' }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="name" label="Requester Name" rules={[{ required: true, message: 'Please enter a name' }]}>
                                <Input placeholder="E.g. Amal Perera" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="contactNo" label="Contact No" rules={[{ required: true, message: 'Please enter contact number' }]}>
                                <Input placeholder="07XXXXXXXX" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="emergencyType" label="Type of Emergency" rules={[{ required: true, message: 'Please select at least one type' }]}>
                                <Select mode="multiple" placeholder="E.g. Medical, Flood">
                                    <Option value="medical">Medical</Option>
                                    <Option value="flood">Flood</Option>
                                    <Option value="fire">Fire</Option>
                                    <Option value="rescue">Rescue</Option>
                                    <Option value="food">Food</Option>
                                    <Option value="shelter">Shelter</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="urgencyLevel" label="Urgency" rules={[{ required: true, message: 'Required' }]}>
                                <Select placeholder="Select">
                                    <Option value="high">High</Option>
                                    <Option value="medium">Medium</Option>
                                    <Option value="low">Low</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="numberOfPeople" label="No. of People" rules={[{ required: true, message: 'Required' }]}>
                                <InputNumber min={1} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="location" label="Location" rules={[{ required: true, message: 'Please enter a location' }]}>
                        <Input placeholder="City or Address" />
                    </Form.Item>
                    <Form.Item name="description" label="Description / Details">
                        <Input.TextArea rows={3} placeholder="Provide any additional notes here..." />
                    </Form.Item>
                    <div style={{ textAlign: 'right', marginTop: '32px' }}>
                        <Space>
                            <Button onClick={handleCreateCancel}>Cancel</Button>
                            <Button type="primary" htmlType="submit">Submit Request</Button>
                        </Space>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default Help;
