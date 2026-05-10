import React, { useState } from 'react';
import {
    Table, Button, Typography, Tag, Modal, Form, Input, Select,
    Space, message, Card, Row, Col, InputNumber, Tooltip, Descriptions, Divider, theme
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    SendOutlined,
    WarningOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import { useAlert } from '../../context/AlertContext';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Alerts = () => {
    const { alerts, loading, fetchAlerts, deleteAlert, updateAlertLocal } = useAlert();
    const { token: { colorBgContainer } } = theme.useToken();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [currentAlert, setCurrentAlert] = useState(null);
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();

    const handleEditSubmit = (values) => {
        // Reconstruct the nested structure from flat form fields
        const formattedData = {
            ...values,
            location: {
                name: values.location_name,
                district: values.location_district,
                station_code: values.location_station
            },
            metrics: {
                water_level_m: values.water_level,
                rainfall_mm: values.rainfall
            }
        };
        updateAlertLocal(currentAlert.id, formattedData);
        setIsEditModalVisible(false);
        setCurrentAlert(null);
    };

    const confirmDelete = (id) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this alert record?',
            content: 'This will only remove it from the management panel history.',
            okText: 'Yes',
            okType: 'danger',
            onOk: () => deleteAlert(id)
        });
    };

    const columns = [
        {
            title: 'Alert ID',
            dataIndex: 'alert_id',
            key: 'alert_id',
            width: 180,
            render: (id) => <Text>{id}</Text>
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            width: 150,
            render: (text) => <div style={{ whiteSpace: 'normal', wordWrap: 'break-word', wordBreak: 'break-word' }}>{text}</div>
        },
        {
            title: 'Severity',
            dataIndex: 'severity_level',
            key: 'severity_level',
            width: 80,
            render: (level) => {
                const upperLevel = level?.toUpperCase() || 'UNKNOWN';
                let color = 'default';
                if (upperLevel === 'CRITICAL') color = 'red';
                else if (upperLevel === 'HIGH') color = 'orange';
                else if (upperLevel === 'MEDIUM' || upperLevel === 'WARNING') color = 'gold';
                else if (upperLevel === 'LOW' || upperLevel === 'NORMAL') color = 'blue';
                else if (upperLevel === 'INFO' || upperLevel === 'SUCCESS') color = 'green';
                return <Tag color={color}>{upperLevel}</Tag>;
            }
        },
        {
            title: 'Event Type',
            dataIndex: 'event_type',
            key: 'event_type',
            width: 140,
            render: (type) => <Tag icon={<InfoCircleOutlined />} color="cyan">{type}</Tag>
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 180,
            render: (date) => date ? new Date(date).toLocaleString() : 'N/A'
        },
        {
            title: 'Action',
            key: 'action',
            fixed: 'right',
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View Details">
                        <Button
                            type="default"
                            size="small"
                            style={{ color: '#722ed1', borderColor: '#d3adf7', background: '#f9f0ff' }}
                            icon={<EyeOutlined />}
                            onClick={() => {
                                setCurrentAlert(record);
                                setIsViewModalVisible(true);
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Edit Locally">
                        <Button
                            type="default"
                            size="small"
                            style={{ color: '#1890ff', borderColor: '#91d5ff', background: '#e6f7ff' }}
                            icon={<EditOutlined />}
                            onClick={() => {
                                setCurrentAlert(record);
                                editForm.setFieldsValue({
                                    ...record,
                                    location_name: record.location?.name,
                                    location_district: record.location?.district,
                                    location_station: record.location?.station_code,
                                    water_level: record.metrics?.water_level_m,
                                    rainfall: record.metrics?.rainfall_mm
                                });
                                setIsEditModalVisible(true);
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button
                            type="default"
                            size="small"
                            danger
                            style={{ color: '#ff4d4f', borderColor: '#ffa39e', background: '#fff1f0' }}
                            icon={<DeleteOutlined />}
                            onClick={() => confirmDelete(record.id)}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '24px', background: colorBgContainer, borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <Title level={3} style={{ margin: 0 }}>Disaster Alert Monitor</Title>
                </div>
            </div>

            <Card bordered={false} bodyStyle={{ padding: 0 }} style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
                <Table
                    columns={columns}
                    dataSource={alerts}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        pageSize: 8,
                        showTotal: (total) => `Total ${total} alerts`,
                        showSizeChanger: true
                    }}
                    scroll={{ x: 1000 }}
                />
            </Card>

            {/* View Alert Modal */}
            <Modal
                title="Alert Details"
                open={isViewModalVisible}
                onCancel={() => setIsViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalVisible(false)}>Close</Button>
                ]}
                width={700}
            >
                {currentAlert && (
                    <Descriptions bordered column={2}>
                        <Descriptions.Item label="Alert ID" span={2}>{currentAlert.alert_id || currentAlert.id || 'N/A'}</Descriptions.Item>
                        <Descriptions.Item label="Title" span={2}>{currentAlert.title || 'Untitled Alert'}</Descriptions.Item>
                        <Descriptions.Item label="Severity">
                            <Tag color={
                                currentAlert.severity_level?.toUpperCase() === 'CRITICAL' ? 'red' :
                                    currentAlert.severity_level?.toUpperCase() === 'HIGH' ? 'orange' :
                                        (currentAlert.severity_level?.toUpperCase() === 'MEDIUM' || currentAlert.severity_level?.toUpperCase() === 'WARNING') ? 'gold' :
                                            (currentAlert.severity_level?.toUpperCase() === 'LOW' || currentAlert.severity_level?.toUpperCase() === 'NORMAL') ? 'blue' :
                                                (currentAlert.severity_level?.toUpperCase() === 'INFO' || currentAlert.severity_level?.toUpperCase() === 'SUCCESS') ? 'green' :
                                                    'default'
                            }>
                                {currentAlert.severity_level?.toUpperCase() || 'UNKNOWN'}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Event Type">{currentAlert.event_type || 'Unknown'}</Descriptions.Item>
                        <Descriptions.Item label="Location" span={2}>
                            {currentAlert.location?.name || 'Unknown'}, {currentAlert.location?.district || 'Unknown'}
                            {currentAlert.location?.station_code ? ` (Code: ${currentAlert.location.station_code})` : ''}
                        </Descriptions.Item>
                        <Descriptions.Item label="Metrics">
                            {currentAlert.metrics?.water_level_m !== undefined ? `Water: ${currentAlert.metrics.water_level_m}m` : ''}
                            {currentAlert.metrics?.water_level_m !== undefined && currentAlert.metrics?.rainfall_mm !== undefined ? <br /> : ''}
                            {currentAlert.metrics?.rainfall_mm !== undefined ? `Rainfall: ${currentAlert.metrics.rainfall_mm}mm` : ''}
                            {currentAlert.metrics?.water_level_m === undefined && currentAlert.metrics?.rainfall_mm === undefined ? 'No metrics available' : ''}
                        </Descriptions.Item>
                        <Descriptions.Item label="Confidence">
                            {currentAlert.confidence ? `${Math.round(currentAlert.confidence * 100)}%` : 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Created At">
                            {currentAlert.created_at ? new Date(currentAlert.created_at).toLocaleString() : 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Short Message" span={2}>{currentAlert.short_message || 'No short message'}</Descriptions.Item>
                        <Descriptions.Item label="Detailed Message" span={2}>
                            <Paragraph>{currentAlert.detailed_message || 'No detailed message available.'}</Paragraph>
                        </Descriptions.Item>
                        <Descriptions.Item label="Recommended Actions" span={2}>
                            {currentAlert.recommended_action && (Array.isArray(currentAlert.recommended_action) ? (
                                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                                    {currentAlert.recommended_action.map((action, i) => <li key={i}>{action}</li>)}
                                </ul>
                            ) : (
                                <Text>{currentAlert.recommended_action}</Text>
                            ))}
                            {!currentAlert.recommended_action && <Text type="secondary">No recommended actions</Text>}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>

            {/* Edit Local Record Modal */}
            <Modal
                title="Edit Alert Record (Local Only)"
                open={isEditModalVisible}
                onCancel={() => setIsEditModalVisible(false)}
                onOk={() => editForm.submit()}
                confirmLoading={loading}
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleEditSubmit}
                >
                    <Form.Item name="title" label="Title">
                        <TextArea disabled autoSize={{ minRows: 1, maxRows: 3 }} />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="severity_level" label="Severity">
                                <Select disabled>
                                    <Option value="CRITICAL">Critical</Option>
                                    <Option value="HIGH">High</Option>
                                    <Option value="MEDIUM">Medium</Option>
                                    <Option value="LOW">Low</Option>
                                    <Option value="INFO">Info</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="event_type" label="Event Type">
                                <Input disabled />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="location_district" label="District">
                                <Input disabled />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="location_name" label="Area Name">
                                <Input disabled />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="water_level" label="Water Level (m)">
                                <InputNumber disabled style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="rainfall" label="Rainfall (mm)">
                                <InputNumber disabled style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="short_message" label="Short Message">
                        <Input />
                    </Form.Item>
                    <Form.Item name="detailed_message" label="Detailed Message">
                        <TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Alerts;
