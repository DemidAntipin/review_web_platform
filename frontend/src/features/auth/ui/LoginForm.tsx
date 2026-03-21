import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../model/auth.store';
import s from './login-form.module.scss';
import { Field } from '@/shared/ui/field/Field';
import { Button } from '@/shared/ui/button/Button';

interface LoginFormProps {
    onToggle: () => void;
}

export const LoginForm = ({ onToggle }: { onToggle: () => void }) => {
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(formData.username, formData.password);
            navigate('/');
        } catch (err) {
            setError('Неверный логин или пароль');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className={s.form} onSubmit={handleSubmit}>
            <div className={s.header}>
                <h1>Вход</h1>
                <p>Платформа рецензирования</p>
            </div>

            <div className={s.inputs}>
                <Field 
                    label="Логин" 
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Введите username"
                    disabled={isLoading}
                    required
                />
                <Field 
                    label="Пароль" 
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    disabled={isLoading}
                    required
                />
            </div>

            {error && <div className={s.errorMessage}>{error}</div>}

            <Button type="submit" disabled={isLoading}>{isLoading ? 'Вход...' : 'Войти'}</Button>

            <div className={s.footer}>
                Нет аккаунта? <span onClick={onToggle}>Зарегистрироваться</span>
            </div>
        </form>
    );
};