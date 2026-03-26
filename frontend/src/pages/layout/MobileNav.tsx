import { LayoutGrid, Users, MessageSquareQuote } from 'lucide-react';
import { NavLink, useParams } from 'react-router-dom';
import s from './layout.module.scss';
import clsx from 'clsx';

export const MobileNav = () => {
    const { projectId } = useParams<{ projectId: string }>();

    if (!projectId) return null; 

    const navItems = [
        { to: `/projects/${projectId}/reviewers`, label: 'Рецензенты', Icon: Users },
        { to: `/projects/${projectId}/kanban`, label: 'Канбан', Icon: LayoutGrid },
        { to: `/projects/${projectId}/responses`, label: 'Ответы', Icon: MessageSquareQuote },
    ];
    return (
        <nav className={s.mobileFooter}>
            {navItems.map(({ to, label, Icon }) => (
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