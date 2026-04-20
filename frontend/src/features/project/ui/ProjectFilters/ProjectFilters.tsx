import React from 'react';
import { SlidersHorizontal, Check, SortAsc, SortDesc } from 'lucide-react';
import { Dropdown } from '@/shared/ui/dropdown/Dropdown';
import { IconButton } from '@/shared/ui/icon_button/IconButton';
import { ProjectStatus, SortDirection, ProjectSortField } from '@/entities/project/model/types';
import clsx from 'clsx';
import s from './ProjectFilters.module.scss';
import { Button } from '@/shared/ui/button/Button';

const statusLabels: Record<ProjectStatus, string> = {
    in_progress: 'В работе',
    completed: 'Завершен',
    accepted: 'Принят',
    closed: 'Закрыт'
};

interface Props {
    selectedStatuses: ProjectStatus[];
    onStatusChange: (status: ProjectStatus) => void;
    journals: string[];
    selectedJournals: string[];
    onJournalChange: (journal: string) => void;
    showHidden: boolean;
    onToggleHidden: () => void;
    onReset: () => void;
    sortField: ProjectSortField;
    sortDirection: SortDirection;
    onSortChange: (field: ProjectSortField, direction: SortDirection) => void;
}

export const ProjectFilters = React.memo(({
    selectedStatuses, onStatusChange,
    journals, selectedJournals, onJournalChange,
    showHidden, onToggleHidden,
    onReset, sortField, sortDirection, onSortChange,
}: Props) => {
    return (
        <Dropdown trigger={
            <IconButton size="md">
                <SlidersHorizontal size={20} />
            </IconButton>
        }>
            <div className={s.filterMenu}>
                <div className={s.section}>
                    <span className={s.sectionTitle}>По статусу</span>
                    {(Object.keys(statusLabels) as ProjectStatus[]).map(status => (
                        <label key={status} className={s.filterItem}>
                            <input 
                                type="checkbox" 
                                checked={selectedStatuses.includes(status)} 
                                onChange={() => onStatusChange(status)} 
                            />
                            <div className={s.customCheckbox}>
                                <Check size={12} />
                            </div>
                            <span>{statusLabels[status]}</span>
                        </label>
                    ))}
                </div>

                <div className={s.divider} />

                <div className={s.section}>
                    <span className={s.sectionTitle}>По журналу</span>
                    {journals.map(journal => (
                        <label key={journal} className={s.filterItem}>
                            <input 
                                type="checkbox" 
                                checked={selectedJournals.includes(journal)} 
                                onChange={() => onJournalChange(journal)} 
                            />
                            <div className={s.customCheckbox}>
                                <Check size={12} />
                            </div>
                            <span>{journal}</span>
                        </label>
                    ))}
                </div>

                <div className={s.divider} />

                <div className={s.section}>
                    <label className={s.filterItem}>
                        <input 
                            type="checkbox" 
                            checked={showHidden} 
                            onChange={onToggleHidden} 
                        />
                        <div className={s.customCheckbox}>
                            <Check size={12} />
                        </div>
                        <span className={s.highlight}>Отображать скрытые</span>
                    </label>
                </div>
                
                <div className={s.divider} />

                <div className={s.section}>
                    <span className={s.sectionTitle}>Сортировка</span>
                    <div className={s.sortRow}>
                        <select 
                            className={s.select} 
                            value={sortField} 
                            onChange={(e) => onSortChange(e.target.value as ProjectSortField, sortDirection)}
                        >
                            <option value="created_at">По дате</option>
                            <option value="title">По названию</option>
                            <option value="deadline">По дедлайну</option>
                        </select>
                        
                        <IconButton  
                            onClick={() => onSortChange(sortField, sortDirection === 'asc' ? 'desc' : 'asc')}
                        >
                            {sortDirection === 'asc' ? <SortAsc size={20} /> : <SortDesc size={20} />}
                        </IconButton>
                    </div>
                </div>
                <Button variant='primary' onClick={onReset}>
                    Сбросить фильтры
                </Button>
            </div>
        </Dropdown>
    );
});