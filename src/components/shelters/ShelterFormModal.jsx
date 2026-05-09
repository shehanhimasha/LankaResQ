import React, { useState, useRef } from 'react';
import { Modal, Form, Input, Select, Button, Space, InputNumber, AutoComplete, Row, Col } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const ShelterFormModal = ({ isModalVisible, setIsModalVisible, form, handleAddShelter }) => {
    const [options, setOptions] = useState([]);
    const [searching, setSearching] = useState(false);
    const searchTimeout = useRef(null);

    const handleSearch = (value) => {
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }
        
        if (!value) {
            setOptions([]);
            return;
        }

        setSearching(true);
        searchTimeout.current = setTimeout(async () => {
            try {
                // Nominatim API restricted to Sri Lanka (countrycodes=lk)
                const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=lk`);
                const data = response.data;
                const newOptions = data.map(item => ({
                    value: item.display_name,
                    label: item.display_name,
                    lat: item.lat,
                    lon: item.lon
                }));
                setOptions(newOptions);
            } catch (error) {
                console.error("Error fetching locations:", error);
            } finally {
                setSearching(false);
            }
        }, 800); // 800ms debounce
    };

    const handleSelect = (value, option) => {
        form.setFieldsValue({
            location: value,
            latitude: option.lat,
            longitude: option.lon
        });
    };

    return (
        <Modal
            title="Add New Shelter"
            open={isModalVisible}
            onCancel={() => {
                setIsModalVisible(false);
                setOptions([]);
            }}
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
                    rules={[{ required: true, message: 'Please enter or select a location' }]}
                >
                    <AutoComplete
                        options={options}
                        onSearch={handleSearch}
                        onSelect={handleSelect}
                        placeholder="Search for a location in Sri Lanka (e.g. Colombo 07)"
                        notFoundContent={searching ? "Searching..." : "No location found"}
                    />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="latitude"
                            label="Latitude"
                            rules={[{ required: true, message: 'Please enter latitude' }]}
                        >
                            <Input placeholder="6.9271" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="longitude"
                            label="Longitude"
                            rules={[{ required: true, message: 'Please enter longitude' }]}
                        >
                            <Input placeholder="79.8612" />
                        </Form.Item>
                    </Col>
                </Row>

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
