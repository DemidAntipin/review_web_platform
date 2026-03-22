import { LayoutGrid, Folder, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import s from './layout.module.scss';

export const MobileNav = () => (
    <nav className={s.mobileFooter}>
        <NavLink to="/reviewers" className={s.navLink}>
            <Folder size={24} />
            <span>Рецензенты</span>
        </NavLink>
        <NavLink to="/kanban" className={s.navLink}>
            <LayoutGrid size={24} />
            <span>Канбан-Доска</span>
        </NavLink>
        <NavLink to="/responses" className={s.navLink}>
            <User size={24} />
            <span>Ответы</span>
        </NavLink>
    </nav>
);