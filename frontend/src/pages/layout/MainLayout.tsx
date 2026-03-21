import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/shared/widgets/sidebar/Sidebar';
import { UserInfo } from '@/entities/user/ui/UserInfo';
import s from './layout.module.scss';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { Loader } from '@/shared/ui/loader/Loader';
import clsx from 'clsx';

export const MainLayout = () => {
    const [pageTitle, setPageTitle] = useState('');
    const { user, token, checkAuth, isLoading } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (token && !user) {
            checkAuth().catch(() => navigate('/login'));
        } 
        else if (!token) {
            navigate('/login');
        }
    }, [token, user, checkAuth, navigate]);

    if (isLoading || (token && !user)) {return <Loader />;}

    if (token && !user) return null;

    return (
        <div className={s.layout}>
            {user && <Sidebar user={user} />}

            <header className={s.header}>
                <div className={s.headerContent}>
                    <h1 className={clsx(s.pageTitle, s.desktopOnly)}>{pageTitle}</h1>                   
                    {user && <UserInfo user={user} className={s.mobileOnly} dropdownPosition="bottom-left" />}
                </div>
            </header>

            <main className={s.content}>
                <Outlet context={{ setPageTitle }} />
            </main>
        </div>
    );
};