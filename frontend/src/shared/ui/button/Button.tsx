import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import s from './button.module.scss';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'dashed' | 'danger';
    fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ 
    children, 
    variant = 'primary', 
    fullWidth, 
    className,
    ...props 
}, ref) => {
    return (
        <button
            ref={ref}
            className={clsx(s.button, s[variant], fullWidth && s.fullWidth, className)}
            {...props}
        >
            {children}
        </button>
    );
});