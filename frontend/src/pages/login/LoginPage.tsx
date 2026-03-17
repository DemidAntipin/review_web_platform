import { LoginForm } from '@/features/auth/ui/LoginForm';
import s from './login-page.module.scss';

export const LoginPage = () => {
    return (
        <div className={s.pageWrapper}>
            <LoginForm />
        </div>
    );
};