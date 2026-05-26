import { Button } from "@/shared/ui/button/Button";
import { useCallback, useState } from "react";
import s from './LogFilters.module.scss';
import { useUserSearch } from "@/features/project/lib/hooks/useUserSearch";
import { UserSearchSelect } from "@/features/project/ui/TeamMenu/MemberForm/UserSearchSelect";
import { MultiSelector } from "@/shared/ui/multi_select/MultiSelector";
import { Field } from "@/shared/ui/field/Field";
import { useProjectSearch } from "@/features/project/lib/hooks/useProjectSearch";
import { ProjectSearchSelect } from "@/features/project/ui/TeamMenu/MemberForm/ProjectSearchSelect";

interface LogFiltersProps {
    onSearch: (filters: any) => void;
    isLoading: boolean;
}

export const LogFilters = ({ onSearch, isLoading }: LogFiltersProps) => {
    const [selectedUsers, setSelectedUsers] = useState<Map<number, string>>(new Map());
    const [selectedProjects, setSelectedProjects] = useState<Map<number, string>>(new Map());
    const [dates, setDates] = useState({ start: '', end: '' });
    
    const { searchTerm: userTerm, setSearchTerm: setUserTerm, suggestions: userSugg } = useUserSearch(false);
    const { searchTerm: projTerm, setSearchTerm: setProjTerm, suggestions: projSugg } = useProjectSearch(false);

    const handleSelect = (setter: React.Dispatch<React.SetStateAction<Map<number, string>>>, clearSearch: () => void) => 
        (item: { id: number, username?: string, title?: string }) => {
            setter(prev => {
                const next = new Map(prev);
                next.set(item.id, item.username || item.title || '');
                return next;
            });
            clearSearch();
        };

    const handleRemove = (setter: React.Dispatch<React.SetStateAction<Map<number, string>>>) => (id: number) => {
        setter(prev => {
            const next = new Map(prev);
            next.delete(id);
            return next;
        });
    };

    const handleSubmit = () => {
        onSearch({
            user_ids: Array.from(selectedUsers.keys()),
            project_ids: Array.from(selectedProjects.keys()),
            start_period: dates.start || undefined,
            end_period: dates.end || undefined,
        });
    };

    return (
        <div className={s.container}>
            <div className={s.filterGrid}>
                <div className={s.filterGroup}>
                    <UserSearchSelect
                        label="Авторы"
                        value={userTerm}
                        onChange={setUserTerm}
                        suggestions={userSugg}
                        onSelect={handleSelect(setSelectedUsers, () => setUserTerm(''))}
                        placeholder="Введите имя пользователя"
                    />
                    <MultiSelector
                        items={Array.from(selectedUsers).map(([id, label]) => ({ id, label }))} 
                        onRemove={handleRemove(setSelectedUsers)} 
                    />
                </div>

                <div className={s.filterGroup}>
                    <ProjectSearchSelect
                        label="Проекты"
                        value={projTerm}
                        onChange={setProjTerm}
                        suggestions={projSugg}
                        onSelect={handleSelect(setSelectedProjects, () => setProjTerm(''))}
                    />
                    <MultiSelector
                        items={Array.from(selectedProjects).map(([id, label]) => ({ id, label }))} 
                        onRemove={handleRemove(setSelectedProjects)} 
                    />
                </div>

                <div className={s.dateSection}>
                    <div className={s.dateInputs}>
                        <Field
                            label="От"
                            type="date" 
                            value={dates.start}
                            onChange={e => setDates(prev => ({ ...prev, start: e.target.value }))}
                        />
                        <Field
                            label="До"
                            type="date" 
                            value={dates.end}
                            onChange={e => setDates(prev => ({ ...prev, end: e.target.value }))}
                        />
                    </div>
                </div>

                <div className={s.submitBtnWrapper}>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={isLoading} 
                        variant="primary"
                        fullWidth
                        className={s.submitBtn}
                    >
                        {isLoading ? '...' : 'Применить'}
                    </Button>
                </div>
            </div>
        </div>
)};