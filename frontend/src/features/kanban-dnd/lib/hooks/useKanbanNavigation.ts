import { useRef, useEffect, useState } from 'react';

export const useKanbanNavigation = (columns: readonly { id: number; label: string }[]) => {
    const [activeTab, setActiveTab] = useState<number>(columns[0].id);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    
    const columnsRef = useRef<Record<number, HTMLDivElement | null>>({});

    const scrollToColumn = (id: number) => {
        const element = columnsRef.current[id];
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            setActiveTab(id);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('data-id');
                        if (id) setActiveTab(Number(id));
                    }
                });
            },
            { root: scrollContainerRef.current, threshold: 0.6 }
        );

        Object.values(columnsRef.current).forEach(col => col && observer.observe(col));
        return () => observer.disconnect();
    }, [columns]);

    return { activeTab, scrollToColumn, scrollContainerRef, columnsRef };
};