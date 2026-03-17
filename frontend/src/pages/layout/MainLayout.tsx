import clsx from 'clsx';
import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/model/auth.store';
import s from './layout.module.scss';

export const MainLayout = () => {
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className={s.layout}>
      <header className={s.header}>
        <nav>
          <Link to="/">Главная</Link>
        </nav>
        <button onClick={logout}>Выйти</button>
      </header>

      <main className={clsx(s['body'])}>
        <Outlet />
      </main>
    </div>
  );
};