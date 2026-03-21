import React, { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import s from './icon_button.module.scss';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    size?: 'sm' | 'md' | 'lg';
}

export const IconButton: React.FC<IconButtonProps> = ({ 
    children, 
    size = 'md', 
    className, 
    ...props 
}) => {
    return (
        <button className={clsx(s.iconBtn, s[size], className)} {...props}>
            {children}
        </button>
    );
};