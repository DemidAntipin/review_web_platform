import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/shared/widgets/sidebar/Sidebar';
import { UserInfo } from '@/entities/user/ui/UserInfo';
import s from './layout.module.scss';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { Loader } from '@/shared/ui/loader/Loader';
import { SlidersHorizontal } from 'lucide-react';
import { IconButton } from '@/shared/ui/icon_button/IconButton';
import { MobileNav } from './MobileNav';
import clsx from 'clsx';

export const MainLayout = () => {
    const [pageTitle, setPageTitle] = useState('');
    const [headerActions, setHeaderActions] = useState<React.ReactNode>(null);
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

    return (
        <div className={s.layout}>
            {user && <Sidebar user={user} />}

            <header className={s.header}>
                <div className={s.headerContent}>
                    <h1 className={clsx(s.pageTitle, s.desktopOnly)}>{pageTitle}</h1>                   
                    {user && <UserInfo user={user} className={s.mobileOnly} dropdownPosition="bottom-left" />}
                </div>
            </header>

            <section className={s.actionsBar}>
                <div className={s.gridContainer}>
                    <div className={s.searchSection}>
                        <input className={s.searchInput} placeholder="Поиск" />
                        <IconButton size="md">
                            <SlidersHorizontal size={20} />
                        </IconButton>
                    </div>
                    <div className={s.pageActionsSlot}>
                        {headerActions}
                    </div>
                </div>
            </section>

            <main className={s.content}>
                <div className={s.gridContainer}>
                    <Outlet context={{ setPageTitle, setHeaderActions }} />
                </div>
            </main>
            <MobileNav />
        </div>
    );
};