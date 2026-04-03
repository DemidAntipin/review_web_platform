import { ReactNode, forwardRef } from 'react';
import s from './board.module.scss';
import clsx from 'clsx';

interface BoardGridProps {
    children: ReactNode;
    columnsCount?: number;
    className?: string;
}

export const BoardGrid = forwardRef<HTMLDivElement, BoardGridProps>(
    ({ children, columnsCount = 4, className }, ref) => {
        return (
            <div 
                ref={ref} 
                className={clsx(s.boardGrid, className)}
                style={{ '--columns-count': columnsCount } as React.CSSProperties}
            >
                {children}
            </div>
        );
    }
);