import { useState } from 'react';
import { LoginForm } from '@/features/auth/ui/LoginForm';
import { RegisterForm } from '@/features/auth/ui/RegisterForm';
import s from './login-page.module.scss';

export const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);

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