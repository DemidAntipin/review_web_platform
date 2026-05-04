import { ReactNode, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './dialog.module.scss';

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
}

export const Dialog = ({ isOpen, onClose, title, children }: DialogProps) => {
    const mouseDownTarget = useRef<EventTarget | null>(null);
    
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, handleKeyDown]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        mouseDownTarget.current = e.target;
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
        if (
            mouseDownTarget.current === e.currentTarget && 
            e.target === e.currentTarget
        ) {
            onClose();
        }
        mouseDownTarget.current = null;
    };

    if (!isOpen) return null;

    return createPortal(
        <div className={styles.overlay} onMouseDown={handleMouseDown} onClick={handleMouseUp}>
            <div 
                className={styles.content} 
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    {title && <h2>{title}</h2>}
                    <button className={styles.closeBtn} onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className={styles.body}>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};