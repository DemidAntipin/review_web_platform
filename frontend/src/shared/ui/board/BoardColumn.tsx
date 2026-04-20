import { ReactNode, forwardRef } from 'react';
import s from './board.module.scss';
import clsx from 'clsx';

interface BoardColumnProps {
    label: string;
    children: ReactNode;
    className?: string;
    titleClassName?: string;
    listClassName?: string;
    actionMenu?: ReactNode;
}

export const BoardColumn = forwardRef<HTMLDivElement, BoardColumnProps>(
    ({ label, children, className, titleClassName, listClassName, actionMenu, ...props }, ref) => {
        return (
            <div ref={ref} className={clsx(s.column, className)} {...props}>
                <div className={s.header}>
                    <h2 className={clsx(s.columnTitle, titleClassName)}>{label}</h2>
                    <div onClick={e => e.stopPropagation()}>
                        {actionMenu}
                    </div>
                </div>
                <div className={clsx(s.contentList, listClassName)}>
                    {children}
                </div>
            </div>
        );
    }
);