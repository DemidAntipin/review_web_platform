import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { User as UserIcon, Bell, Settings, Moon, Sun, LogOut, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { User } from '../model/types';
import { IconButton } from '@/shared/ui/icon_button/IconButton';
import { Dropdown, DropdownItem } from '@/shared/ui/dropdown/Dropdown';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { useTheme } from '@/app/providers/ThemeProvider';
import s from './user_info.module.scss';

interface UserInfoProps {
    user: User;
    className?: string;
    onNotificationClick?: () => void;
    dropdownPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'right-top';
}

export const UserInfo: React.FC<UserInfoProps> = ({ user, className, onNotificationClick, dropdownPosition = 'bottom-left' }) => {
    const { logout } = useAuthStore();
    const { theme, toggleTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const menuItems: DropdownItem[] = [
        { label: 'Настройки', icon: <Settings size={18} />, to: '/settings' },
        { label: theme === 'dark' ? 'Светлая тема' : 'Тёмная тема', icon: theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />, onClick: toggleTheme },
        { label: 'Выйти', icon: <LogOut size={18} />, onClick: logout, variant: 'danger', divider: true },
    ];

    return (
        <div className={clsx(s.profileWrapper, className)}>
            <Dropdown
                onOpenChange={setIsMenuOpen}
                position={dropdownPosition}
                items={menuItems}
                trigger={
                    <div className={s.userInfo} style={{ cursor: 'pointer' }}>
                        <div className={s.avatar}>
                            {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : <UserIcon size={20} />}
                        </div>
                        <div className={s.text}>
                            <div className={s.name}>{user.username}</div>
                            <div className={s.role}>{user.role}</div>
                        </div>
                        <ChevronDown size={16} className={clsx(s.arrow, isMenuOpen && s.arrowActive)} />
                    </div>
                }
            />         
            <IconButton onClick={onNotificationClick} size="sm">
                <Bell size={20} />
            </IconButton>
        </div>
    );
};