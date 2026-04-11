import React from 'react';
import useLogin from '../../hooks/useLogin';
import AuthCard from '../../components/auth/AuthCard';
import LoginForm from '../../components/auth/LoginForm';

const Login = () => {
    const { onFinish, loading } = useLogin();

    return (
        <AuthCard>
            <LoginForm onFinish={onFinish} loading={loading} />
        </AuthCard>
    );
};

export default Login;
