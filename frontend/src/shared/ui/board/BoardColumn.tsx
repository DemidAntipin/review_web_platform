import { ReactNode, forwardRef } from 'react';
import s from './board.module.scss';
import clsx from 'clsx';

interface BoardColumnProps {
    label: string;
    children: ReactNode;
    className?: string;
    titleClassName?: string;
    listClassName?: string;
}

export const BoardColumn = forwardRef<HTMLDivElement, BoardColumnProps>(
    ({ label, children, className, titleClassName, listClassName, ...props }, ref) => {
        return (
            <div ref={ref} className={clsx(s.column, className)} {...props}>
                <h2 className={clsx(s.columnTitle, titleClassName)}>{label}</h2>
                <div className={clsx(s.contentList, listClassName)}>
                    {children}
                </div>
            </div>
        );
    }
);