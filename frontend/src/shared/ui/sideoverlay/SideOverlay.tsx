import React, { ReactNode } from 'react';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import s from './SideOverlay.module.scss';
import { useMediaQuery } from '@/shared/lib/hooks/useMediaQuery';

interface SideOverlayProps {
    isOpen: boolean;
    onToggle: () => void;
    title?: string;
    position?: 'left' | 'right';
    children: ReactNode;
    className?: string;
}

export const SideOverlay = ({ isOpen, onToggle, title, children, position = 'left', className }: SideOverlayProps) => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const getIcon = () => {
        if (position === 'left') {
            return isOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />;
        }
        return isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />;
    };

    const content = (
        <div className={clsx(
            className,
            s.wrapper, 
            s[position],
            s.push,
            isOpen && s.active, 
        )}>
            <button
                type="button"
                className={clsx(s.tabTrigger, !isOpen && position === 'right' && s.hideTrigger)} 
                onClick={onToggle}
            >
                {getIcon()}
            </button>
            <aside className={s.overlayContent}>
                {title && (
                    <div className={s.header}>
                        <span>{title}</span>
                    </div>
                )}
                <div className={s.content}>
                    {children}
                </div>
            </aside>
        </div>
    );

    return isMobile ? createPortal(content, document.body) : content;
};