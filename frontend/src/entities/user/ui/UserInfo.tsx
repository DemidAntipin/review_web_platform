import { useEffect, useMemo, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { User as UserIcon, Settings, Moon, Sun, LogOut, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { User } from '../model/types';
import { Dropdown } from '@/shared/ui/dropdown/Dropdown';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { useTheme } from '@/app/providers/ThemeProvider';
import s from './user_info.module.scss';
import { Placement } from '@floating-ui/react';
import { ROLE_MAP } from '@/shared/config/roles';
import { useProjectMembers } from '@/features/project/lib/hooks/useProjectMembers';

interface UserInfoProps {
    className?: string;
    dropdownPosition?: Placement;
}

export const UserInfo: React.FC<UserInfoProps> = ({ className, dropdownPosition }) => {
    const user = useAuthStore((state) => state.user);
    const { logout } = useAuthStore();
    const { theme, toggleTheme } = useTheme();
    
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const { projectId } = useParams<{ projectId: string }>();
    const project_id = Number(projectId) || 0;

    const { members, fetchMembers } = useProjectMembers(project_id);

    useEffect(() => {
        if (!projectId) return;
        fetchMembers();
    }, [projectId, fetchMembers]);

    const displayRole = useMemo(() => {
        if (!projectId || !members.length || !user) return user?.role;
        const currentMember = members.find(m => m.user_id === user.id);
        if (!currentMember) return user.role;
        return ROLE_MAP[currentMember.role as keyof typeof ROLE_MAP] || user.role;
    }, [projectId, members, user]);

    if (!user) return null;

    return (
        <div className={clsx(s.profileWrapper, className)}>
            <Dropdown
                position={dropdownPosition ? dropdownPosition : 'bottom-end'}
                onOpenChange={setIsDropdownOpen}
                trigger={
                    <div className={s.userInfo}>
                        <div className={s.avatar}>
                             {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : <UserIcon size={20} />}
                        </div>
                        <div className={s.text}>
                            <div className={s.name}>{user.username}</div>
                            <div className={s.role}>{displayRole}</div>
                        </div>
                        <ChevronDown 
                            size={16} 
                            className={clsx(s.arrow, isDropdownOpen && s.arrowActive)} 
                        />
                    </div>
                }
            >
                <div className={s.menuList}>
                    <NavLink to="/settings" className={s.menuItem}>
                        <Settings size={18} /> <span>Настройки</span>
                    </NavLink>
                    <button onClick={toggleTheme} className={s.menuItem}>
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        <span>{theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}</span>
                    </button>
                    <div className={s.divider} />
                    <button onClick={logout} className={clsx(s.menuItem, s.danger)}>
                        <LogOut size={18} /> <span>Выйти</span>
                    </button>
                </div>
            </Dropdown>
        </div>
    );
};