import { LayoutGrid, Users, MessageSquareQuote, LayoutDashboard, FolderKanban, ClipboardList } from 'lucide-react';
import { NavLink, useParams } from 'react-router-dom';
import s from './layout.module.scss';
import clsx from 'clsx';
import { useAuthStore } from '@/features/auth/model/auth.store';

export const MobileNav = () => {
    const { projectId } = useParams<{ projectId: string }>();

    const navItems = [
        { to: '/profile', label: 'Мой профиль', Icon: LayoutDashboard },
        { to: '/projects', label: 'Мои проекты', Icon: FolderKanban },
        { to: '/logs', label: 'Логи системы', Icon: ClipboardList, isAdminOnly: true },
    ];

    const projectNav = [
        { to: `/projects/${projectId}/reviewers`, label: 'Рецензенты', Icon: Users },
        { to: `/projects/${projectId}/kanban`, label: 'Канбан', Icon: LayoutGrid },
        { to: `/projects/${projectId}/responses`, label: 'Ответы', Icon: MessageSquareQuote },
    ];

    const { user: currentUser } = useAuthStore();

    const filteredNavItems = navItems.filter(item => {
        if (item.isAdminOnly) {
            return currentUser?.role === 'Админ';
        }
        return true;
    });

    if (!projectId) return (
        <nav className={s.mobileFooter}>
            {filteredNavItems.map(({ to, label, Icon }) => (
                <NavLink 
                    key={to} 
                    to={to} 
                    className={({ isActive }) => clsx(s.navLink, isActive && s.active)}>
                    <Icon size={22} />
                    <span>{label}</span>
                </NavLink>
            ))}
        </nav>    
    ); 

    return (
        <nav className={s.mobileFooter}>
            {projectNav.map(({ to, label, Icon }) => (
                <NavLink 
                    key={to} 
                    to={to} 
                    className={({ isActive }) => clsx(s.navLink, isActive && s.active)}>
                    <Icon size={22} />
                    <span>{label}</span>
                </NavLink>
            ))}
        </nav>
    );
};