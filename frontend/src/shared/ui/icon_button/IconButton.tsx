import React, { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import s from './icon_button.module.scss';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    size?: 'sm' | 'md' | 'lg';
    variant?: 'ghost' | 'danger';
}

export const IconButton: React.FC<IconButtonProps> = ({ 
    children, 
    size = 'md',
    variant = 'ghost',
    className, 
    ...props 
}) => {
    return (
        <button className={clsx(s.iconBtn, s[variant], s[size], className)} {...props}>
            {children}
        </button>
    );
};