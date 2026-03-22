import { useRef, useEffect } from 'react';
import { Button } from '@/shared/ui/button/Button';
import s from './kanban.module.scss';
import clsx from 'clsx';

interface StatusStripProps {
    columns: { id: string; label: string }[];
    activeTab: string;
    onTabClick: (id: string) => void;
}

export const StatusStrip = ({ columns, activeTab, onTabClick }: StatusStripProps) => {
    const tabsRef = useRef<{ [key: string]: HTMLButtonElement | null }>({});

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
                    className={clsx(s.statusTab, activeTab === col.id && s.active)}
                    onClick={() => onTabClick(col.id)}
                >
                    {col.label}
                </Button>
            ))}
        </div>
    );
};