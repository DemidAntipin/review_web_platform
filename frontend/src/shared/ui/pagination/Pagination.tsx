import { NavLink, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import s from './Pagination.module.scss';

interface PaginationProps {
    total: number;
    current: number;
    className?: string;
}

export const Pagination = ({ total, current, className }: PaginationProps) => {
    const location = useLocation();

    const createPageLink = (page: number) => {
        const searchParams = new URLSearchParams(location.search);
        searchParams.set('page', page.toString());
        return { search: `?${searchParams.toString()}` };
    };

    const getPages = () => {
        const pages: (number | string)[] = [];
        const range = 1;
        const left = current - range;
        const right = current + range;

        for (let i = 1; i <= total; i++) {
            if (i === 1 || i === total || (i >= left && i <= right)) {
                pages.push(i);
            } else if (i === left - 1 || i === right + 1) {
                pages.push('...');
            }
        }
        return pages.filter((item, index, arr) => item !== '...' || arr[index - 1] !== '...');
    };

    if (total <= 1) return null;

    return (
        <nav className={clsx(s.pagination, className)}>
            {current > 1 && (
                <NavLink
                    to={createPageLink(current - 1)}
                    className={s.arrow}
                >
                    <ChevronLeft size={20} />
                </NavLink>
            )}

            <div className={s.pages}>
                {getPages().map((page, index) => (
                    <div key={index} className={s.item}>
                        {typeof page === 'number' ? (
                            <NavLink
                                to={createPageLink(page)}
                                className={clsx(s.link, { [s.active]: page === current })}
                            >
                                {page}
                            </NavLink>
                        ) : (
                            <span className={s.ellipsis}>{page}</span>
                        )}
                    </div>
                ))}
            </div>

            {current < total && (
                <NavLink
                    to={createPageLink(current + 1)}
                    className={s.arrow}
                >
                    <ChevronRight size={20} />
                </NavLink>
            )}
        </nav>
    );
};