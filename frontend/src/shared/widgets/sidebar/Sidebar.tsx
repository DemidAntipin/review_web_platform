import { Link, NavLink, useParams } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Users, LayoutGrid, MessageSquareQuote } from 'lucide-react';
import { UserInfo } from '@/entities/user/ui/UserInfo';
import s from './sidebar.module.scss';
import { User } from '@/entities/user/model/types';
import clsx from 'clsx';

const NAV_ITEMS = [
    { to: '/profile', label: 'Личный кабинет', Icon: LayoutDashboard },
    { to: '/projects', label: 'Мои проекты', Icon: FolderKanban },
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
    return (
        <aside className={s.sidebar}>
            <Link to="/" className={s.logoWrapper}><div className={s.logo}></div></Link>
            <nav className={s.nav}>
                {NAV_ITEMS.map(({ to, label, Icon }) => (
                    <NavLink key={to} to={to} className={({isActive}) => clsx(s.link, isActive && s.active)}>
                        <Icon size={20} /> {label}
                    </NavLink>
                ))}
                {projectId && (
                    <div className={s.projectSection}>
                        <div className={s.divider} />
                        {PROJECT_NAV(projectId).map(({ to, label, Icon }) => (
                            <NavLink 
                                key={to} 
                                to={to} 
                                className={({isActive}) => clsx(s.link, isActive && s.active)}>
                                <Icon size={20} /> {label}
                            </NavLink>
                        ))}
                    </div>
                )}
            </nav>

            <div className={s.bottom}>
                <UserInfo user={user} className={s.desktopProfile} dropdownPosition="top-start" />
            </div>
        </aside>
    );
};