import React from 'react';
import { SlidersHorizontal, Check } from 'lucide-react';
import { Dropdown } from '@/shared/ui/dropdown/Dropdown';
import { IconButton } from '@/shared/ui/icon_button/IconButton';
import { Button } from '@/shared/ui/button/Button';
import s from './ReviewerFilters.module.scss';

interface Props {
    types: string[];
    priorities: string[];
    selectedTypes: string[];
    selectedPriorities: string[];
    reviewersList: { id: number; name: string }[];
    selectedReviewerIds: number[];
    onReviewerChange: (id: number) => void;
    onTypeChange: (type: string) => void;
    onPriorityChange: (priority: string) => void;
    
    showHidden: boolean;
    onToggleHidden: () => void;
    onReset: () => void;
}

export const ReviewerFilters = React.memo(({
    types, priorities,
    selectedTypes, selectedPriorities,
    onTypeChange, onPriorityChange,
    showHidden, onToggleHidden,
    onReset, selectedReviewerIds, reviewersList, 
    onReviewerChange
}: Props) => {
    return (
        <Dropdown trigger={
            <IconButton size="md">
                <SlidersHorizontal size={20} />
            </IconButton>
        }>
            <div className={s.filterMenu}>
                <div className={s.section}>
                    <span className={s.sectionTitle}>Приоритет</span>
                    <div className={s.list}>
                        {priorities.map(p => (
                            <label key={p} className={s.filterItem}>
                                <input 
                                    type="checkbox" 
                                    checked={selectedPriorities.includes(p)}
                                    onChange={() => onPriorityChange(p)}
                                />
                                <div className={s.customCheckbox}>
                                    <Check size={12} />
                                </div>
                                <span>{p}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className={s.divider} />

                <div className={s.section}>
                    <span className={s.sectionTitle}>Тип замечания</span>
                    <div className={s.list}>
                        {types.map(t => (
                            <label key={t} className={s.filterItem}>
                                <input 
                                    type="checkbox" 
                                    checked={selectedTypes.includes(t)}
                                    onChange={() => onTypeChange(t)}
                                />
                                <div className={s.customCheckbox}>
                                    <Check size={12} />
                                </div>
                                <span>{t}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className={s.divider} />

                <div className={s.section}>
                    <span className={s.sectionTitle}>Рецензенты</span>
                    <div className={s.list}>
                        {reviewersList.map(r => (
                            <label key={r.id} className={s.filterItem}>
                                <input 
                                    type="checkbox" 
                                    checked={selectedReviewerIds.includes(r.id)}
                                    onChange={() => onReviewerChange(r.id)}
                                />
                                <div className={s.customCheckbox}>
                                    <Check size={12} />
                                </div>
                                <span>{r.name}</span>
                            </label>
                        ))}
                    </div>
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

                <Button variant='primary' onClick={onReset} style={{ marginTop: '8px' }}>
                    Сбросить фильтры
                </Button>
            </div>
        </Dropdown>
    );
});