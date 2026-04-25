import React, { useEffect } from 'react';
import { Typography, Form, Input, Button, Card, message, Row, Col } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined, SaveOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;

const Settings = () => {
    const { user, updateProfile, usersDb } = useAuth();
    const [form] = Form.useForm();

    useEffect(() => {
        if (user && usersDb) {
            const masterProfile = usersDb.find(u => u.email === user.email);
            form.setFieldsValue({
                name: user.name,
                email: user.email,
                contact: user.contact || '',
                password: masterProfile?.password || ''
            });
        }
    }, [user, usersDb, form]);

    const onFinish = async (values) => {
        try {
            await updateProfile(values);
            message.success('Profile updated successfully');
        } catch (error) {
            message.error('Failed to update profile');
        }
    };

    return (
        <div>
            <Title level={2} style={{ marginBottom: 24 }}>Profile Settings</Title>

            <Row gutter={24}>
                <Col xs={24} lg={12}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                        >
                            <Form.Item
                                name="name"
                                label="Full Name"
                                rules={[{ required: true, message: 'Please enter your name' }]}
                            >
                                <Input prefix={<UserOutlined />} placeholder="Full Name" />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                label="Email Address"
                                rules={[
                                    { required: true, message: 'Please enter your email' },
                                    { type: 'email', message: 'Enter a valid email' }
                                ]}
                            >
                                <Input prefix={<MailOutlined />} placeholder="Email" />
                            </Form.Item>

                            <Form.Item
                                name="contact"
                                label="Contact Number"
                                rules={[{ required: true, message: 'Please enter your contact number' }]}
                            >
                                <Input prefix={<PhoneOutlined />} placeholder="Contact Number" />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                label="Password"
                                tooltip="Change your password here"
                                rules={[{ required: true, message: 'Please enter new password' }]}
                            >
                                <Input.Password prefix={<LockOutlined />} placeholder="New Password" />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large" block>
                                    Save Changes
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Settings;
