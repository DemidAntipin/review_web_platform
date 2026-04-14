import { useEffect, useMemo, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/shared/widgets/sidebar/Sidebar';
import { UserInfo } from '@/entities/user/ui/UserInfo';
import s from './layout.module.scss';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { Loader } from '@/shared/ui/loader/Loader';
import { MobileNav } from './MobileNav';
import clsx from 'clsx';

export const MainLayout = () => {
    const [pageTitle, setPageTitle] = useState('');
    const [headerActions, setHeaderActions] = useState(null);
    const [headerSearch, setHeaderSearch] = useState<React.ReactNode>(null);
    const { user, token, checkAuth, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const contextValue = useMemo(() => ({
        setPageTitle,
        setHeaderActions,
        setHeaderSearch
    }), []);

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
                    <h1 className={clsx(s.pageTitle, s.desktopOnly)} onClick={() => navigate("/projects")}>{pageTitle}</h1>                   
                    {user && <UserInfo user={user} className={s.mobileOnly} dropdownPosition="bottom-start" />}
                </div>
            </header>

            <section className={s.actionsBar}>
                <div className={s.gridContainer}>
                    <h1 className={clsx(s.pageTitle, s.mobileOnly)} onClick={() => navigate("/projects")}>
                        {pageTitle}
                    </h1>   
                    <div className={s.searchSection}>
                        {headerSearch}
                    </div>
                    <div className={clsx(s.pageActionsSlot, s.desktopOnly)}>
                        {headerActions}
                    </div>
                </div>
            </section>

            <main className={s.content}>
                <div className={s.gridContainer}>
                    <Outlet context={{ setPageTitle, setHeaderActions, setHeaderSearch }} />
                </div>
            </main>
            <div className={clsx(s.mobileFooter, s.mobileOnly)}>{headerActions}</div>
            <MobileNav />
        </div>
    );
};