import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import s from './dropdown.module.scss';
import { Button } from '../button/Button';

export interface DropdownItem {
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    to?: string;
    variant?: 'default' | 'danger';
    divider?: boolean;
}

type DropdownPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'right-top';

interface DropdownProps {
    trigger: React.ReactNode;
    items: DropdownItem[];
    className?: string;
    position?: DropdownPosition;
    onOpenChange?: (isOpen: boolean) => void;
}

export const Dropdown: React.FC<DropdownProps> = ({ 
    trigger, 
    items, 
    className, 
    position = 'bottom-right', 
    onOpenChange
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        onOpenChange?.(isOpen);
    }, [isOpen, onOpenChange]);

    const positionClasses: Record<DropdownPosition, string> = {
        'bottom-right': s.bottomRight,
        'bottom-left': s.bottomLeft,
        'top-right': s.topRight,
        'top-left': s.topLeft,
        'right-top': s.rightTop,
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={clsx(s.wrapper, className)} ref={menuRef}>
            <div onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
                {trigger}
            </div>

            {isOpen && (
                <div className={clsx(s.menu, positionClasses[position])}>
                    {items.map((item, index) => (
                        <React.Fragment key={index}>
                            {item.divider && <div className={s.divider} />}
                            {item.to ? (
                                <NavLink 
                                    to={item.to} 
                                    className={clsx(s.item, item.variant && s[item.variant])} 
                                    onClick={() => setIsOpen(false)}>
                                    {item.icon}
                                    <span>{item.label}</span>
                                </NavLink>
                            ) : (
                                <Button
                                    variant="ghost"
                                    fullWidth
                                    className={clsx(s.item, item.variant === 'danger' && s.danger)}
                                    onClick={() => {
                                        item.onClick?.();
                                        setIsOpen(false);
                                    }}>
                                    {item.icon}
                                    <span>{item.label}</span>
                                </Button>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            )}
        </div>
    );
};