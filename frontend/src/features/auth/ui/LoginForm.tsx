import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../model/auth.store';
import s from './login-form.module.scss';

export const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            await login(username, password);
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
                <h1>Вход в систему</h1>
                <p>Платформа рецензирования статей</p>
            </div>

            <div className={s.inputs}>
                <div className={s.field}>
                    <label>Логин</label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Введите ваш username"
                        disabled={isLoading}
                        required 
                    />
                </div>

                <div className={s.field}>
                    <label>Пароль</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={isLoading}
                        required 
                    />
                </div>
            </div>

            {error && <span className={s.error}>{error}</span>}

            <button type="submit" className={s.submitBtn} disabled={isLoading}>
                {isLoading ? 'Вход...' : 'Войти'}
            </button>

            <div className={s.footer}>
                <span>Нет аккаунта? Обратитесь к администратору</span>
            </div>
        </form>
    );
};