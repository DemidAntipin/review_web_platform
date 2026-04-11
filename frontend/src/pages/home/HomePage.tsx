import { useEffect, useMemo, useState } from 'react';
import { ProjectCard } from '@/entities/project/ui/ProjectCard/ProjectCard';
import { useProjectStore } from '@/entities/project/model/project.store';
import { useOutletContext } from 'react-router-dom';
import { Loader } from '@/shared/ui/loader/Loader';
import { useProjectSocket } from '@/features/project/lib/hooks/useProjectSocket';
import { CreateProjectForm } from '@/features/project/ui/ProjectForm/CreateProjectForm';
import { useAuthStore } from '@/features/auth/model/auth.store';
import s from './home-page.module.scss';
import { ProjectMenu } from '@/features/project/ui/ProjectMenu/ProjectMenu';
import { ProjectFilters } from '@/features/project/ui/ProjectFilters/ProjectFilters';
import { ProjectStatus, STATUS_MAP } from '@/entities/project/model/types';

export const HomePage = () => {
    const { setPageTitle, setHeaderActions, setHeaderSearch } = useOutletContext<any>();
    
    const { 
        projects, setProjects, isLoading,
        searchQuery, setSearchQuery,
        showHidden, setShowHidden,
        selectedJournals, toggleJournal,
        selectedStatuses, toggleStatus,
        resetFilters, sortField, sortDirection
    } = useProjectStore();
    const user = useAuthStore(state => state.user);

    useProjectSocket();

    const headerAction = useMemo(() => <CreateProjectForm />, []);

    const [hiddenIds, setHiddenIds] = useState<number[]>([]);

    const journals = useMemo(() => 
        Array.from(new Set(projects.map(p => p.journal))).filter(Boolean), 
    [projects]);

    const toggleHide = (id: number) => {
        setHiddenIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const filteredProjects = useMemo(() => {
        const filtered = projects.filter(p => {
            const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                p.journal.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesJournal = selectedJournals.length === 0 || selectedJournals.includes(p.journal);
            
            const isHidden = hiddenIds.includes(p.id);
            const matchesVisibility = showHidden ? isHidden : !isHidden;

            const currentStatus = typeof p.status === 'number' ? STATUS_MAP[p.status] : p.status;
            const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(currentStatus as ProjectStatus);
            
            return matchesSearch && matchesJournal && matchesVisibility && matchesStatus;
        });
        
        return [...filtered].sort((a, b) => {
            let comparison = 0;
            
            const valA = a[sortField] ?? '';
            const valB = b[sortField] ?? '';

            if (valA < valB) comparison = -1;
            if (valA > valB) comparison = 1;

            return sortDirection === 'asc' ? comparison : -comparison;
        });
}, [projects, searchQuery, selectedJournals, selectedStatuses, showHidden, sortField, sortDirection]);

    useEffect(() => {
        setPageTitle('Мои проекты');
        setHeaderActions(<CreateProjectForm />);
        
        const setSort = useProjectStore.getState().setSort;
        
        setHeaderSearch(
            <div className={s.searchWrap}>
                <input 
                    className={s.searchInput} 
                    placeholder="Поиск по названию..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <ProjectFilters 
                    journals={journals}
                    selectedJournals={selectedJournals}
                    onJournalChange={toggleJournal}
                    showHidden={showHidden}
                    onToggleHidden={() => setShowHidden(!showHidden)} selectedStatuses={selectedStatuses}
                    onStatusChange={toggleStatus}
                    onReset={resetFilters}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSortChange={setSort}
                />
            </div>
        );

        setProjects();

        return () => {
            setHeaderActions(null);
            setHeaderSearch(null);
        };
    }, [searchQuery, selectedJournals, showHidden, journals]);

    if (isLoading && projects.length === 0) {
        return <div className={s.loaderWrap}><Loader /></div>;
    }

    return (
        <div className={s.container}>
            <div className={s.grid}>
                {filteredProjects.map(p => (
                    <ProjectCard 
                        key={p.id}
                        project={p}
                        actionMenu={
                            <ProjectMenu 
                                project={p}
                                isHidden={hiddenIds.includes(p.id)}
                                onToggleHide={() => toggleHide(p.id)}
                            />
                        }
                    />
                ))}
                {filteredProjects.length === 0 && (
                    <div className={s.emptyState}><h3>Проекты не найдены</h3></div>
                )}
            </div>
        </div>
    );
};
