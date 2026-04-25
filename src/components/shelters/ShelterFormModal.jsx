import React from 'react';
import { Modal, Form, Input, Select, Button, Space, InputNumber } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

const { Option } = Select;

const ShelterFormModal = ({ isModalVisible, setIsModalVisible, form, handleAddShelter }) => {
    return (
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
    );
};

export default ShelterFormModal;
