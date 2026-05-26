import { useActivityLogStore } from '@/entities/logs/model/logs.store';
import { SortAsc, SortDesc } from 'lucide-react';
import clsx from 'clsx';
import s from './LogTable.module.scss';

const COLUMNS = [
    { id: 'created_at', label: 'Дата' },
    { id: 'user_id', label: 'Пользователь' },
    { id: 'project_id', label: 'Проект' },
    { id: 'action_type', label: 'Действие' },
];

export const LogTable = () => {
    const { logs, sort, setSort } = useActivityLogStore();

    return (
        <div className={s.tableWrapper}>
            <table className={s.table}>
                <thead>
                    <tr>
                        {COLUMNS.map(col => (
                            <th 
                                key={col.id} 
                                onClick={() => setSort(col.id)} 
                                className={clsx(s.sortable, s.compactCell)}
                            >
                                <div className={clsx(s.headerContent, sort.field === col.id && s.active)}>
                                    {col.label}
                                    <span className={clsx(s.sortIconWrapper)}>
                                        {sort.order === 'asc' ? <SortAsc size={14}/> : <SortDesc size={14}/>}
                                    </span>
                                </div>
                            </th>
                        ))}
                        <th className={s.expandCell}>Описание</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map(log => (
                        <tr key={log.id}>
                            <td className={s.compactCell}>{new Date(log.created_at).toLocaleString()}</td>
                            <td className={s.compactCell}>{log.user_id}</td>
                            <td className={s.compactCell}>{log.project_id}</td>
                            <td className={s.compactCell}>
                                <span className={s.badge}>{log.action_type}</span>
                            </td>
                            <td className={s.expandCell}>{log.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};