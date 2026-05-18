import React, { useEffect, useState } from 'react';
import { Typography, Form, Input, Button, Card, message, Row, Col, Upload, Avatar, Divider, theme } from 'antd';
import { 
    UserOutlined, 
    MailOutlined, 
    PhoneOutlined, 
    LockOutlined, 
    SaveOutlined, 
    UploadOutlined,
    CameraOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const { token: { colorBgContainer } } = theme.useToken();
    const [form] = Form.useForm();
    const [imageUrl, setImageUrl] = useState(null);

    useEffect(() => {
        if (user) {
            // If user has separate first/last name, use them, otherwise split the full name
            const firstName = user.firstName || user.name?.split(' ')[0] || '';
            const lastName = user.lastName || user.name?.split(' ').slice(1).join(' ') || '';
            
            form.setFieldsValue({
                firstName,
                lastName,
                email: user.email,
                contact: user.contact || '',
            });
            setImageUrl(user.profileImage || null);
        }
    }, [user, form]);

    const getBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleUpload = async ({ file }) => {
        // In a real app, you'd upload to a server. Here we'll just use Base64 for demo.
        const base64 = await getBase64(file);
        setImageUrl(base64);
        message.success('Image uploaded temporarily. Save changes to finalize.');
    };

    const onFinish = async (values) => {
        try {
            const updatedData = {
                ...values,
                name: `${values.firstName} ${values.lastName}`,
                profileImage: imageUrl
            };
            await updateProfile(updatedData);
            message.success('Profile updated successfully');
        } catch (error) {
            message.error('Failed to update profile');
        }
    };

    return (
        <div style={{ padding: '24px', background: colorBgContainer, borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Title level={3} style={{ marginBottom: 24 }}>Profile Settings</Title>

            <Row gutter={24}>
                {/* Profile Image Section */}
                <Col xs={24} lg={8}>
                    <Card 
                        bordered={false} 
                        style={{ 
                            boxShadow: '0 4px 15px rgba(0,0,0,0.05)', 
                            textAlign: 'center',
                            borderRadius: '12px'
                        }}
                    >
                        <Title level={4} style={{ marginBottom: 20 }}>Profile Picture</Title>
                        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 24 }}>
                            <Avatar 
                                size={120} 
                                icon={<UserOutlined />} 
                                src={imageUrl}
                                style={{ 
                                    background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
                                    border: `4px solid ${colorBgContainer}`,
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                }}
                            />
                            <Upload
                                showUploadList={false}
                                customRequest={handleUpload}
                                accept="image/*"
                            >
                                <Button 
                                    shape="circle" 
                                    icon={<CameraOutlined />} 
                                    style={{ 
                                        position: 'absolute', 
                                        bottom: 5, 
                                        right: 5, 
                                        background: colorBgContainer,
                                        border: '1px solid #d9d9d9',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                    }} 
                                />
                            </Upload>
                        </div>
                        <Text type="secondary" block style={{ fontSize: '13px' }}>
                            Upload a high-quality profile picture to be recognized across the system.
                        </Text>
                        <Divider />
                        <div style={{ textAlign: 'left' }}>
                            <Text strong block style={{ fontSize: '16px' }}>{user?.name}</Text>
                            <Text type="secondary" style={{ display: 'block', marginTop: '4px' }}>{user?.role}</Text>
                        </div>
                    </Card>
                </Col>

                {/* Form Section */}
                <Col xs={24} lg={16}>
                    <Card 
                        bordered={false} 
                        style={{ 
                            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                            borderRadius: '12px'
                        }}
                    >
                        <Title level={4} style={{ marginBottom: 24 }}>Personal Information</Title>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            requiredMark={false}
                        >
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="firstName"
                                        label="First Name"
                                        rules={[{ required: true, message: 'Please enter your first name' }]}
                                    >
                                        <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder="First Name" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="lastName"
                                        label="Last Name"
                                        rules={[{ required: true, message: 'Please enter your last name' }]}
                                    >
                                        <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder="Last Name" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="email"
                                label="Email Address"
                                rules={[
                                    { required: true, message: 'Please enter your email' },
                                    { type: 'email', message: 'Enter a valid email' }
                                ]}
                            >
                                <Input prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} placeholder="Email" />
                            </Form.Item>

                            <Form.Item
                                name="contact"
                                label="Contact Number"
                                rules={[{ required: true, message: 'Please enter your contact number' }]}
                            >
                                <Input prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />} placeholder="Contact Number" />
                            </Form.Item>

                            <Divider orientation="left" style={{ margin: '32px 0 24px' }}>Security</Divider>

                            <Form.Item
                                name="password"
                                label="Update Password"
                                tooltip="Leave it as is if you don't want to change it"
                                rules={[{ required: true, message: 'Please enter a password' }]}
                            >
                                <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="Password" />
                            </Form.Item>

                            <Form.Item style={{ marginTop: 40, marginBottom: 0 }}>
                                <Button 
                                    type="primary" 
                                    htmlType="submit" 
                                    icon={<SaveOutlined />} 
                                    size="large" 
                                    style={{ height: '48px', padding: '0 40px' }}
                                >
                                    Save Profile Changes
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Profile;
