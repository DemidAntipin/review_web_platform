import { useRef, useEffect, useState } from 'react';

export const useKanbanNavigation = (columns: { id: string }[]) => {
    const [activeTab, setActiveTab] = useState(columns[0].id);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const columnsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

    const scrollToColumn = (id: string) => {
        const element = columnsRef.current[id];
        if (element) {
            element.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' });
            setActiveTab(id);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('data-id');
                        if (id) setActiveTab(id);
                    }
                });
            },
            { root: scrollContainerRef.current, threshold: 0.6 }
        );

        Object.values(columnsRef.current).forEach(col => col && observer.observe(col));
        return () => observer.disconnect();
    }, []);

    return { activeTab, scrollToColumn, scrollContainerRef, columnsRef };
};