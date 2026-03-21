import { Link, NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban } from 'lucide-react';
import { UserInfo } from '@/entities/user/ui/UserInfo';
import s from './sidebar.module.scss';
import { User } from '@/entities/user/model/types';
import clsx from 'clsx';

const NAV_ITEMS = [
    { to: '/profile', label: 'Личный кабинет', Icon: LayoutDashboard },
    { to: '/', label: 'Мои проекты', Icon: FolderKanban },
];

interface SidebarProps {
  user: User;
}

export const Sidebar = ({ user }: SidebarProps) => {
    return (
        <aside className={s.sidebar}>
            <Link to="/" className={s.logoWrapper}><div className={s.logo}></div></Link>
            <nav className={s.nav}>
                {NAV_ITEMS.map(({ to, label, Icon }) => (
                    <NavLink key={to} to={to} className={({isActive}) => clsx(s.link, isActive && s.active)}>
                        <Icon size={20} /> {label}
                    </NavLink>
                ))}
            </nav>

            <div className={s.bottom}>
                <UserInfo user={user} className={s.desktopProfile} dropdownPosition="top-left" />
            </div>
        </aside>
    );
};