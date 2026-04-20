import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProjectCard } from '@/entities/project/ui/ProjectCard/ProjectCard';
import { useProjectStore } from '@/entities/project/model/project.store';
import { useOutletContext } from 'react-router-dom';
import { Loader } from '@/shared/ui/loader/Loader';
import { useProjectSocket } from '@/features/project/lib/hooks/useProjectSocket';
import { CreateProjectForm } from '@/features/project/ui/ProjectForm/CreateProjectForm';
import s from './home-page.module.scss';
import { ProjectMenu } from '@/features/project/ui/ProjectMenu/ProjectMenu';
import { ProjectFilters } from '@/features/project/ui/ProjectFilters/ProjectFilters';
import { ProjectStatus, STATUS_MAP } from '@/entities/project/model/types';
import { useShallow } from 'zustand/react/shallow';

export const HomePage = () => {
    const { setPageTitle, setHeaderActions, setHeaderSearch } = useOutletContext<any>();
    
    const store = useProjectStore(useShallow((state) => ({
        projects: state.projects,
        setProjects: state.setProjects,
        isLoading: state.isLoading,
        searchQuery: state.searchQuery,
        setSearchQuery: state.setSearchQuery,
        showHidden: state.showHidden,
        setShowHidden: state.setShowHidden,
        selectedJournals: state.selectedJournals,
        toggleJournal: state.toggleJournal,
        selectedStatuses: state.selectedStatuses,
        toggleStatus: state.toggleStatus,
        resetFilters: state.resetFilters,
        sortField: state.sortField,
        sortDirection: state.sortDirection,
        setSort: state.setSort,
    })));

    useProjectSocket();

    const [localSearch, setLocalSearch] = useState(store.searchQuery);
    const [hiddenIds, setHiddenIds] = useState<Set<number>>(new Set());

    const journals = useMemo(() => 
        Array.from(new Set(store.projects.map(p => p.journal))).filter(Boolean), 
    [store.projects]);

    const toggleHide = useCallback((id: number) => {
        setHiddenIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            store.setSearchQuery(localSearch);
        }, 300);
        return () => clearTimeout(handler);
    }, [localSearch, store.setSearchQuery]);

    const filteredProjects = useMemo(() => {
        const query = store.searchQuery.toLowerCase().trim();
        const { selectedJournals, selectedStatuses, showHidden, sortField, sortDirection } = store;

        const filtered = store.projects.filter(p => {
            const matchesSearch = !query || 
                p.title.toLowerCase().includes(query) || 
                p.journal.toLowerCase().includes(query);
            
            if (!matchesSearch) return false;

            if (selectedJournals.length > 0 && !selectedJournals.includes(p.journal)) return false;

            const matchesHidden = showHidden || !hiddenIds.has(p.id);
            if (!matchesHidden) return false;

            if (selectedStatuses.length > 0) {
                const currentStatus = typeof p.status === 'number' ? STATUS_MAP[p.status] : p.status;
                if (!selectedStatuses.includes(currentStatus as ProjectStatus)) return false;
            }

            return true;
        });

        return filtered.sort((a, b) => {
            const aVal = a[sortField] ?? '';
            const bVal = b[sortField] ?? '';
            
            const result = typeof aVal === 'string' 
                ? aVal.localeCompare(bVal as string)
                : (aVal as any) - (bVal as any);

            return sortDirection === 'asc' ? result : -result;
        });
    }, [store.projects, store.searchQuery, store.selectedJournals, store.selectedStatuses, store.showHidden, store.sortField, store.sortDirection, hiddenIds]);

    useEffect(() => {
        setPageTitle('Мои проекты');
        setHeaderActions(<CreateProjectForm />);
        return () => {
            setHeaderSearch(null);
            setHeaderActions(null);
        };
    }, []);

    useEffect(() => {
        store.setProjects();
    }, []);

    const handleToggleHidden = useCallback(() => {
        store.setShowHidden(!store.showHidden);
    }, [store.showHidden, store.setShowHidden]);

    useEffect(() => {
    setHeaderSearch(
        <div className={s.searchWrap}>
            <input 
                className={s.searchInput} 
                placeholder="Поиск..." 
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
            />
            <ProjectFilters 
                journals={journals}
                selectedJournals={store.selectedJournals}
                onJournalChange={store.toggleJournal}
                showHidden={store.showHidden}
                onToggleHidden={handleToggleHidden}
                selectedStatuses={store.selectedStatuses}
                onStatusChange={store.toggleStatus}
                onReset={store.resetFilters}
                sortField={store.sortField}
                sortDirection={store.sortDirection}
                onSortChange={store.setSort}
            />
        </div>
    );
    }, [localSearch, journals, handleToggleHidden, store.selectedJournals, store.selectedStatuses, store.showHidden, store.sortField, store.sortDirection]);

    if (store.isLoading && store.projects.length === 0) {
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
                                isHidden={hiddenIds.has(p.id)}
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
