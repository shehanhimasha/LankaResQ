import React from 'react';
import { Modal, Form, Row, Col, Input, Select, InputNumber, Button, Space } from 'antd';

const { Option } = Select;

const CreateRequestModal = ({
    isCreateModalOpen,
    handleCreateCancel,
    form,
    handleCreateSubmit
}) => {
    return (
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
                        <Form.Item name="emergencyType" label="Type of Emergency" rules={[{ required: true, message: 'Please select a type' }]}>
                            <Select placeholder="Select type">
                                <Option value={1}>Rescue</Option>
                                <Option value={2}>Food</Option>
                                <Option value={3}>Shelter</Option>
                                <Option value={4}>Medical</Option>
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
    );
};

export default CreateRequestModal;
