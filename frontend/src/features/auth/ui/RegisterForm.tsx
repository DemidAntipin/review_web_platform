import { useState } from 'react';
import { useAuthStore } from '../model/auth.store';
import { ROLE_MAP } from '@/shared/config/roles';
import { Field } from '@/shared/ui/field/Field';
import { Button } from '@/shared/ui/button/Button';
import s from './login-form.module.scss';

export const RegisterForm = ({ onToggle }: { onToggle: () => void }) => {
    const { register, isLoading } = useAuthStore();
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        username: '', email: '', password: '', confirmPassword: '', role: 1 
    });
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        setError('Допустим только ручной ввод');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'role' ? Number(value) : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) return setError('Пароли не совпадают');
        
        try {
            const { confirmPassword, ...payload } = formData;
            await register(payload);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Ошибка регистрации');
        }
    };

    return (
        <form className={s.form} onSubmit={handleSubmit}>
            <header className={s.header}>
                <h1>Регистрация</h1>
                <p>Создайте аккаунт в системе</p>
            </header>

            <div className={s.inputs}>
                <Field label="Логин" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
                <Field label="Email" name="email" placeholder="useremail@gmail.com" type="email" value={formData.email} onChange={handleChange} required />
                <Field label="Пароль" name="password" placeholder="••••••••" type="password" value={formData.password} onChange={handleChange} required />
                <Field label="Подтвердите пароль (только ручной ввод)" placeholder="••••••••" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} onPaste={handlePaste} required />
                
                <Field label="Роль в системе">
                    <select name="role" value={formData.role} onChange={handleChange}>
                        {Object.entries(ROLE_MAP).map(([id, label]) => (
                            <option key={id} value={id}>{label}</option>
                        ))}
                    </select>
                </Field>
            </div>

            {error && <div className={s.errorMessage}>{error}</div>}

            <Button type="submit" disabled={isLoading}>{isLoading ? 'Создание...' : 'Зарегистрироваться'}</Button>

            <footer className={s.footer}>
                Уже есть аккаунт? <span onClick={onToggle}>Войти</span>
            </footer>
        </form>
    );
};