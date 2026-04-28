import { Link, NavLink, useParams } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Users, LayoutGrid, MessageSquareQuote, ClipboardList } from 'lucide-react';
import { UserInfo } from '@/entities/user/ui/UserInfo';
import s from './sidebar.module.scss';
import { User } from '@/entities/user/model/types';
import clsx from 'clsx';

const NAV_ITEMS = [
    { to: '/profile', label: 'Мой профиль', Icon: LayoutDashboard },
    { to: '/projects', label: 'Мои проекты', Icon: FolderKanban },
    { to: '/logs', label: 'Логи системы', Icon: ClipboardList, isAdminOnly: true },
];

const PROJECT_NAV = (id: string) => [
    { to: `/projects/${id}/reviewers`, label: 'Рецензенты', Icon: Users },
    { to: `/projects/${id}/kanban`, label: 'Канбан-доска', Icon: LayoutGrid },
    { to: `/projects/${id}/responses`, label: 'Ответы рецензенту', Icon: MessageSquareQuote },
];

interface SidebarProps {
  user: User;
}

export const Sidebar = ({ user }: SidebarProps) => {
    const { projectId } = useParams<{ projectId: string }>();

    const filteredNavItems = NAV_ITEMS.filter(item => {
        if (item.isAdminOnly) {
            return user.role === 'Админ';
        }
        return true;
    });

    const projectsIndex = filteredNavItems.findIndex(item => item.to === '/projects');
    const beforeProjects = filteredNavItems.slice(0, projectsIndex + 1);
    const afterProjects = filteredNavItems.slice(projectsIndex + 1);

    const renderLink = ({ to, label, Icon }: typeof NAV_ITEMS[0]) => (
        <NavLink 
            key={to} 
            to={to} 
            className={({ isActive }) => clsx(s.link, isActive && s.active)}
        >
            <Icon size={20} /> {label}
        </NavLink>
    );

    return (
        <aside className={s.sidebar}>
            <Link to="/" className={s.logoWrapper}>
                <div className={s.logo}></div>
            </Link>
            
            <nav className={s.nav}>
                {beforeProjects.map(renderLink)}

                {projectId && (
                    <div className={s.projectSection}>
                        <div className={s.divider} />
                        {PROJECT_NAV(projectId).map(renderLink)}
                        <div className={s.divider} />
                    </div>
                )}

                {afterProjects.map(renderLink)}
            </nav>

            <div className={s.bottom}>
                <UserInfo user={user} className={s.desktopProfile} dropdownPosition="top-start" />
            </div>
        </aside>
    );
};