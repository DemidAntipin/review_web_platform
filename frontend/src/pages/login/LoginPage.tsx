import { useState } from 'react';
import { LoginForm } from '@/features/auth/ui/LoginForm';
import { RegisterForm } from '@/features/auth/ui/RegisterForm';
import s from './login-page.module.scss';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { Navigate } from 'react-router-dom';

export const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);

    const token = useAuthStore((state) => state.token);

    if (token) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className={s.page}>
            {isLogin ? (
                <LoginForm onToggle={() => setIsLogin(false)} />
            ) : (
                <RegisterForm onToggle={() => setIsLogin(true)} />
            )}
        </div>
    );
};