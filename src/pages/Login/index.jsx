import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Divider, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/temp_img.svg';

const Login = () => {
    const { login, googleLogin, googleRegister } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [googleAuthLoading, setGoogleAuthLoading] = useState(false);
    const [googleRegisterLoading, setGoogleRegisterLoading] = useState(false);

    const [form] = Form.useForm();
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    const onFinish = async (values) => {
        setLoading(true);
        try {
            await login(values.email, values.password);
            message.success('Login successful');
            navigate('/', { replace: true });
        } catch (error) {
            console.error("Login failed:", error);
            message.error(error.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async (credentialResponse) => {
        const idToken = credentialResponse?.credential;
        if (!idToken) {
            message.error('Google authentication did not return a token.');
            return;
        }

        setGoogleAuthLoading(true);
        try {
            await googleLogin(idToken);
            message.success('Google login successful');
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Google login failed:', error);
            message.error(error.message || 'Google login failed');
        } finally {
            setGoogleAuthLoading(false);
        }
    };

    const handleGoogleRegister = async (credentialResponse) => {
        const idToken = credentialResponse?.credential;
        if (!idToken) {
            message.error('Google registration did not return a token.');
            return;
        }

        setGoogleRegisterLoading(true);
        try {
            await googleRegister(idToken);
            message.success('Google registration successful');
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Google registration failed:', error);
            message.error(error.message || 'Google registration failed');
        } finally {
            setGoogleRegisterLoading(false);
        }
    };

    const showGoogleAuth = Boolean(googleClientId);
    const googleDisabled = googleAuthLoading || googleRegisterLoading;

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
            <Card style={{ width: 400, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <img src={logo} alt="LankaResQ Logo" style={{ height: 60, marginBottom: 16 }} />
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>LankaResQ Admin</h2>
                </div>
                <Form
                    form={form}
                    name="login_form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Please input your Email!' },
                            { type: 'email', message: 'Please enter a valid email!' }
                        ]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your Password!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="login-form-button"
                            block
                            size="large"
                            loading={loading || googleAuthLoading || googleRegisterLoading}
                            onClick={() => form.submit()}
                        >
                            Log in
                        </Button>
                    </Form.Item>
                </Form>

                <Divider style={{ marginTop: 8, marginBottom: 20 }}>Or continue with Google</Divider>

                {!googleClientId && (
                    <Alert
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                        description="Set VITE_GOOGLE_CLIENT_ID to enable Google authentication."
                    />
                )}

                {showGoogleAuth && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', opacity: googleDisabled ? 0.6 : 1 }}>
                            <GoogleLogin
                                text="signin_with"
                                shape="rectangular"
                                width="340"
                                onSuccess={handleGoogleLogin}
                                onError={() => message.error('Google sign-in failed. Please try again.')}
                                useOneTap={false}
                                disabled={googleDisabled}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', opacity: googleDisabled ? 0.6 : 1 }}>
                            <GoogleLogin
                                text="signup_with"
                                shape="rectangular"
                                width="340"
                                onSuccess={handleGoogleRegister}
                                onError={() => message.error('Google registration failed. Please try again.')}
                                useOneTap={false}
                                disabled={googleDisabled}
                            />
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Login;
