import { useRef, useEffect } from 'react';
import { Button } from '@/shared/ui/button/Button';
import s from './kanban.module.scss';
import clsx from 'clsx';

interface StatusStripProps {
    columns: readonly { id: string | number; label: string }[];
    activeTab: string | number;
    onTabClick: (id: any) => void;
}

export const StatusStrip = ({ columns, activeTab, onTabClick }: StatusStripProps) => {
    const tabsRef = useRef<Record<string | number, HTMLButtonElement | null>>({});

    useEffect(() => {
        const activeTabElement = tabsRef.current[activeTab];
        if (activeTabElement) {
            activeTabElement.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center',
            });
        }
    }, [activeTab]);

    return (
        <div className={clsx(s.statusStrip, s.mobileOnly)}>
            {columns.map(col => (
                <Button 
                    key={col.id}
                    ref={(el) => { tabsRef.current[col.id] = el; }}
                    className={clsx(
                        s.statusTab, 
                        activeTab === col.id && s.active
                    )}
                    onClick={() => onTabClick(col.id)}
                >
                    {col.label}
                </Button>
            ))}
        </div>
    );
};