import clsx from 'clsx';
import s from './home-page.module.scss';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { Link } from 'react-router-dom';

export const HomePage = () => {
    const user = useAuthStore((state) => state.user);

    return (
        <div className={clsx(s['main'])}>
            <div className={clsx(s['content'])}>
                <header className={s['welcome-section']}>
                    <h1>Интеллектуальная платформа рецензирования</h1>
                    <p>Добро пожаловать, {user?.username || 'Коллега'}! У вас есть активные задачи по статьям.</p>
                </header>

                <div className={s['dashboard-grid']}>
                    <Link to="/projects" className={s['card']}>
                        <div className={s['card-icon']}>📝</div>
                        <h3>Мои проекты</h3>
                        <p>Управление статьями, дедлайнами и журналами</p>
                    </Link>

                    <Link to="/kanban" className={s['card']}>
                        <div className={s['card-icon']}>📋</div>
                        <h3>Канбан-доска</h3>
                        <p>Отслеживание прогресса по замечаниям (75% выполнено)</p>
                    </Link>

                    <Link to="/responses" className={s['card']}>
                        <div className={s['card-icon']}>📄</div>
                        <h3>Ответы рецензентам</h3>
                        <p>Экспорт в PDF, DOCX и LaTeX</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};