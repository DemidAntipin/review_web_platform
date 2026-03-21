import React, { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import s from './button.module.scss';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
    children, 
    variant = 'primary', 
    fullWidth, 
    className, 
    ...props 
}) => {
    return (
        <button 
            className={clsx(s.button, s[variant], fullWidth && s.fullWidth, className)} 
            {...props}
        >
            {children}
        </button>
    );
};