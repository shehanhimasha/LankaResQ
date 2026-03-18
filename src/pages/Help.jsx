import React, { useState, useEffect } from 'react';
import { Typography, Card, Form, Input, Select, Checkbox, Button, Divider, message, Tag, Row, Col, theme } from 'antd';
import { PlusOutlined, SaveOutlined, DeleteOutlined, SafetyCertificateOutlined, CoffeeOutlined, HomeOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { useRequest } from '../context/RequestContext';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Help = () => {
    const { token } = theme.useToken();
    const { formSchema, updateSchema } = useRequest();
    const [localSchema, setLocalSchema] = useState([]);
    const [newFieldTitle, setNewFieldTitle] = useState('');

    useEffect(() => {
        setLocalSchema(formSchema);
    }, [formSchema]);

    const handleAddField = () => {
        if (!newFieldTitle.trim()) {
            message.error('Please enter a field title');
            return;
        }
        const newField = {
            id: `custom_${Date.now()}`,
            type: 'text',
            label: newFieldTitle,
            required: false,
            fixed: false,
        };
        setLocalSchema([...localSchema, newField]);
        setNewFieldTitle('');
        message.success('Field added');
    };

    const handleRemoveField = (id) => {
        setLocalSchema(localSchema.filter(field => field.id !== id));
    };

    const handleSaveForm = () => {
        updateSchema(localSchema);
        message.success('Form schema updated successfully!');
    };

    // Helper to render icon for emergency type
    const renderIcon = (iconName) => {
        switch (iconName) {
            case 'SafetyCertificateOutlined': return <SafetyCertificateOutlined />;
            case 'CoffeeOutlined': return <CoffeeOutlined />;
            case 'HomeOutlined': return <HomeOutlined />;
            case 'MedicineBoxOutlined': return <MedicineBoxOutlined />;
            default: return null;
        }
    };

    // Helper to find field by ID
    const getField = (id) => localSchema.find(f => f.id === id);

    // Generic Field Renderer
    const renderFieldInput = (field) => {
        if (!field) return null;
        return (
            <div style={{
                position: 'relative',
                padding: 12,
                border: `1px dashed ${token.colorBorder}`,
                borderRadius: 8,
                background: field.fixed ? token.colorFillAlter : token.colorBgContainer,
                height: '100%'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text strong style={{ fontSize: 14 }}>{field.label} {field.required && <span style={{ color: 'red' }}>*</span>}</Text>
                    {!field.fixed && (
                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemoveField(field.id)} size="small" />
                    )}
                </div>

                {field.type === 'checkbox-group' && (
                    <Row gutter={[8, 8]}>
                        {field.options.map(opt => (
                            <Col span={12} key={opt.value}>
                                <div style={{ padding: '8px', border: '1px solid #d9d9d9', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12 }}>
                                    <Checkbox value={opt.value} disabled />
                                    {renderIcon(opt.icon)}
                                    <span>{opt.label}</span>
                                </div>
                            </Col>
                        ))}
                    </Row>
                )}

                {field.type === 'select' && (
                    <Select placeholder="Select urgency" disabled style={{ width: '100%' }}>
                        {field.options.map(opt => (
                            <Option key={opt.value} value={opt.value}>
                                <Tag color={opt.color}>{opt.label}</Tag>
                            </Option>
                        ))}
                    </Select>
                )}

                {field.type === 'number' && <Input type="number" placeholder="Enter number" disabled />}
                {field.type === 'textarea' && <TextArea rows={3} placeholder="Enter details" disabled />}
                {field.type === 'tel' && <Input type="tel" placeholder="Contact number" disabled />}
                {field.type === 'location' && (
                    <Input.Search enterButton="Get Location" placeholder="Type location" disabled />
                )}
                {field.type === 'text' && <Input placeholder={`Enter ${field.label}`} disabled />}
            </div>
        );
    };

    // Separate schema into layout sections
    const emergencyField = getField('emergencyType');
    const urgencyField = getField('urgencyLevel');
    const peopleField = getField('numberOfPeople');
    const detailsField = getField('moreDetails');
    const contactField = getField('contactNumber');
    const locationField = getField('location');
    const customFields = localSchema.filter(f => !f.fixed);

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Help Request Form Builder</Title>
            </div>

            <Card title="Form Configuration" bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Form layout="vertical">
                    {/* Fixed Layout Sections */}
                    {emergencyField && (
                        <div style={{ marginBottom: 16 }}>{renderFieldInput(emergencyField)}</div>
                    )}

                    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                        <Col span={12}>
                            {urgencyField && renderFieldInput(urgencyField)}
                        </Col>
                        <Col span={12}>
                            {peopleField && renderFieldInput(peopleField)}
                        </Col>
                    </Row>

                    {detailsField && (
                        <div style={{ marginBottom: 16 }}>{renderFieldInput(detailsField)}</div>
                    )}

                    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                        <Col span={12}>
                            {contactField && renderFieldInput(contactField)}
                        </Col>
                        <Col span={12}>
                            {locationField && renderFieldInput(locationField)}
                        </Col>
                    </Row>

                    {/* Custom Fields Section */}
                    {customFields.length > 0 && <Divider orientation="left">Custom Fields</Divider>}
                    {customFields.map(field => (
                        <div key={field.id} style={{ marginBottom: 16 }}>
                            {renderFieldInput(field)}
                        </div>
                    ))}
                </Form>

                <Divider orientation="left">Add Field</Divider>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Input
                        placeholder="Field Title (e.g., 'Additional Note')"
                        value={newFieldTitle}
                        onChange={(e) => setNewFieldTitle(e.target.value)}
                        onPressEnter={handleAddField}
                    />
                    <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddField}>
                        Add Field
                    </Button>
                </div>

                <Divider />

                <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveForm} size="large" block>
                    Save Form
                </Button>
            </Card>
        </div>
    );
};

export default Help;
