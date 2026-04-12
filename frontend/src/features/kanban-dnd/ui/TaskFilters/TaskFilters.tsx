import React from 'react';
import { SlidersHorizontal, Check } from 'lucide-react';
import { Dropdown } from '@/shared/ui/dropdown/Dropdown';
import { IconButton } from '@/shared/ui/icon_button/IconButton';
import { Button } from '@/shared/ui/button/Button';
import s from './TaskFilters.module.scss'; 
import { SortAsc, SortDesc } from 'lucide-react';
import { TaskSortField } from '@/entities/task/model/types';
import { SortDirection } from '@/entities/project/model/types';

interface Props {
    types: string[];
    priorities: string[];
    reviewersData: { 
        id: number; 
        name: string; 
        comments: { id: number; text: string; }[]; 
    }[];
    
    selectedTypes: string[];
    selectedPriorities: string[];
    selectedReviewers: number[];
    selectedComments: number[];
    
    onTypeChange: (v: string) => void;
    onPriorityChange: (v: string) => void;
    onReviewerChange: (id: number) => void;
    onCommentChange: (id: number, reviewer: number) => void;
    onReset: () => void;

    sortField: TaskSortField;
    sortDirection: SortDirection;
    onSortChange: (field: TaskSortField, direction: SortDirection) => void;
}

export const TaskFilters: React.FC<Props> = ({
    types, priorities, reviewersData,
    selectedTypes, selectedPriorities, selectedReviewers, selectedComments,
    onTypeChange, onPriorityChange, onReviewerChange, onCommentChange, onReset,
    sortField, sortDirection, onSortChange
}) => {
    return (
        <Dropdown trigger={<IconButton size="md"><SlidersHorizontal size={20} /></IconButton>}>
            <div className={s.filterMenu}>
                <div className={s.section}>
                    <span className={s.sectionTitle}>Тип</span>
                    {types.map(t => (
                        <label key={t} className={s.filterItem}>
                            <input type="checkbox" checked={selectedTypes.includes(t)} onChange={() => onTypeChange(t)} />
                            <div className={s.customCheckbox}><Check size={12} /></div>
                            <span>{t}</span>
                        </label>
                    ))}
                </div>

                <div className={s.divider} />

                <div className={s.section}>
                    <span className={s.sectionTitle}>Приоритет</span>
                    {priorities.map(p => (
                        <label key={p} className={s.filterItem}>
                            <input type="checkbox" checked={selectedPriorities.includes(p)} onChange={() => onPriorityChange(p)} />
                            <div className={s.customCheckbox}><Check size={12} /></div>
                            <span>{p}</span>
                        </label>
                    ))}
                </div>

                <div className={s.divider} />

                <div className={s.section}>
                    <span className={s.sectionTitle}>Рецензенты</span>
                    {reviewersData.map(rev => (
                        <div key={rev.id} style={{ marginBottom: '4px' }}>
                            <label className={s.filterItem}>
                                <input 
                                    type="checkbox" 
                                    checked={selectedReviewers.includes(rev.id)} 
                                    onChange={() => onReviewerChange(rev.id)} 
                                />
                                <div className={s.customCheckbox}><Check size={12} /></div>
                                <span className={s.highlight}>{rev.name}</span>
                            </label>
                            
                            <div style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                {rev.comments.map(comment => (
                                    <label key={comment.id} className={s.filterItem} style={{ padding: '4px 8px' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedComments.includes(comment.id)} 
                                            onChange={() => onCommentChange(comment.id, rev.id)} 
                                        />
                                        <div className={s.customCheckbox}><Check size={12} /></div>
                                        <span style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {comment.text}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className={s.divider} />
                <div className={s.section}>
                    <span className={s.sectionTitle}>Сортировка</span>
                    <div className={s.sortRow}>
                        <select 
                            className={s.select} 
                            value={sortField} 
                            onChange={(e) => onSortChange(e.target.value as TaskSortField, sortDirection)}
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
                <Button variant='primary' onClick={onReset} style={{ marginTop: '8px' }}>Сбросить</Button>
            </div>
        </Dropdown>
    );
};