import { useEffect, useMemo, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/shared/widgets/sidebar/Sidebar';
import { UserInfo } from '@/entities/user/ui/UserInfo';
import s from './layout.module.scss';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { Loader } from '@/shared/ui/loader/Loader';
import { MobileNav } from './MobileNav';
import clsx from 'clsx';
import { useProjectStore } from '@/entities/project/model/project.store';
import { MobileFab } from '@/shared/ui/mobile_actions/MobileFab';
import { useMediaQuery } from '@/shared/lib/hooks/useMediaQuery';

export const MainLayout = () => {
    const [pageTitle, setPageTitle] = useState('');
    const [headerActions, setHeaderActions] = useState(null);
    const [headerSearch, setHeaderSearch] = useState<React.ReactNode>(null);
    const { user, token, checkAuth, isLoading } = useAuthStore();
    const { projects, setProjects } = useProjectStore();
    const navigate = useNavigate();

    const isMobile = useMediaQuery('(max-width: 768px)');

    useEffect(() => {
        const init = async () => {
            if (token && !user) {
                try {
                    await checkAuth();
                } catch {
                    navigate('/login');
                    return;
                }
            } else if (!token) {
                navigate('/login');
                return;
            }
            if (token && projects.length === 0) {
                setProjects();
            }
        };

        init();
    }, [token, user, projects.length]);

    if (isLoading || (token && !user)) {return <Loader />;}

    return (
        <div className={s.layout}>
            {user && <Sidebar user={user} />}

            <header className={s.header}>
                <div className={s.headerContent}>
                    <h1 className={clsx(s.pageTitle, s.desktopOnly)} onClick={() => navigate("/my_projects")}>{pageTitle}</h1>                   
                    {user && <UserInfo user={user} className={s.mobileOnly} dropdownPosition="bottom-start" />}
                </div>
            </header>

            <section className={clsx(s.actionsBar, !(headerSearch || headerActions) && s.mobileOnly)}>
                <div className={s.gridContainer}>
                    <h1 className={clsx(s.pageTitle, s.mobileOnly)} onClick={() => navigate("/my_projects")}>
                        {pageTitle}
                    </h1>
                    {headerSearch && (
                        <div className={s.searchSection}>
                            {headerSearch}
                        </div>
                    )}
                    {headerActions && !isMobile && (
                        <div className={clsx(s.pageActionsSlot)}>
                            {headerActions}
                        </div>
                    )}
                </div>
            </section>

            <main className={s.content}>
                <div className={s.gridContainer}>
                    <Outlet context={{ setPageTitle, setHeaderActions, setHeaderSearch }} />
                </div>
            </main>
            {headerActions && isMobile && (
                <MobileFab>
                    {headerActions}
                </MobileFab>
            )}
            <MobileNav />
        </div>
    );
};