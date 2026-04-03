import { ReactNode } from 'react';
import s from './board.module.scss';
import clsx from 'clsx';

interface BoardProps {
    children: ReactNode;
    className?: string;
}

export const Board = ({ children, className }: BoardProps) => {
    return (
        <div className={clsx(s.container, className)}>
            {children}
        </div>
    );
};