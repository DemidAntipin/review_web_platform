import React, { ReactNode } from 'react';
import clsx from 'clsx';
import s from './Table.module.scss';

export interface Column<T> {
    header: string;
    key: string;
    render?: (item: T) => ReactNode;
    className?: string;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    rowKey: (item: T) => string | number;
    className?: string;
    isLoading?: boolean;
}

export const Table = <T,>({ columns, data, rowKey, className, isLoading }: TableProps<T>) => {
    return (
        <div className={clsx(s.tableWrapper, className)}>
            <table className={s.table}>
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} className={col.className}>{col.header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr><td colSpan={columns.length}>Загрузка...</td></tr>
                    ) : (
                        data.map((item) => (
                            <tr key={rowKey(item)}>
                                {columns.map((col) => (
                                    <td key={col.key} className={col.className}>
                                        {col.render ? col.render(item) : (item[col.key as keyof T] as ReactNode)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};