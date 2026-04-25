import React, { ReactNode } from 'react';
import clsx from 'clsx';
import { BookOpen, ChevronLeft, ChevronRight, X } from 'lucide-react';
import s from './SideOverlay.module.scss';

interface SideOverlayProps {
    isOpen: boolean;
    onToggle: () => void;
    title?: string;
    children: ReactNode;
}

export const SideOverlay = ({ isOpen, onToggle, title, children }: SideOverlayProps) => {
    return (
        <div className={clsx(s.wrapper, isOpen && s.active)}>
            <button
                type="button"
                className={s.tabTrigger} 
                onClick={onToggle}
            >
                {isOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
            <aside className={s.overlay}>
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
};