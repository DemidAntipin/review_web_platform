import { useEffect, useRef } from 'react';

export const useMobileAutoScroll = (
    isDragging: boolean,
    activeTab: string | number,
    columns: readonly { id: string | number; label: string }[],
    scrollToColumn: (id: string | number) => void
) => {
    const activeTabRef = useRef(activeTab);
    const lastScrollTime = useRef(0);

    useEffect(() => {
        activeTabRef.current = activeTab;
    }, [activeTab]);

    useEffect(() => {
        if (!isDragging || window.innerWidth > 768) return;

        const handleTouchMove = (e: TouchEvent) => {
            const clientX = e.touches[0].clientX;
            const now = Date.now();
            if (now - lastScrollTime.current < 400) return;

            const width = window.innerWidth;
            const ZONE = 70;
            const currentIndex = columns.findIndex(col => col.id === activeTabRef.current);

            if (clientX > width - ZONE && currentIndex < columns.length - 1) {
                lastScrollTime.current = now;
                scrollToColumn(columns[currentIndex + 1].id);
            } 
            else if (clientX < ZONE && currentIndex > 0) {
                lastScrollTime.current = now;
                scrollToColumn(columns[currentIndex - 1].id);
            }
        };

        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        return () => window.removeEventListener('touchmove', handleTouchMove);
    }, [isDragging, columns, scrollToColumn]);
};