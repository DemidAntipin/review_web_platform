import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { DndContext, closestCorners, pointerWithin, DragOverlay } from '@dnd-kit/core';
import { KanbanColumn } from './KanbanColumn';
import { useKanbanStore } from '@/features/kanban-dnd/model/kanban.store';
import { useKanbanDnd } from '@/features/kanban-dnd/lib/hooks/useKanbanDnd';
import { StatusStrip } from '@/shared/ui/board/StatusStrip';
import { useBoardNavigation } from '@/shared/lib/hooks/useBoardNavigation';
import { useMobileAutoScroll } from '@/features/kanban-dnd/lib/hooks/useMobileAutoScroll';
import { Loader } from '@/shared/ui/loader/Loader';
import { TaskCard } from '@/entities/task/ui/TaskCard';
import clsx from 'clsx';
import { STATUS_MAP, TaskStatus } from '@/entities/task/model/types';
import { useProjectStore } from '@/entities/project/model/project.store';
import { useKanbanSocket } from '@/features/kanban-dnd/lib/hooks/useKanbanSocket';
import { IconButton } from '@/shared/ui/icon_button/IconButton';
import { ArrowLeft } from 'lucide-react';
import { BoardGrid } from '@/shared/ui/board/BoardGrid';
import { Board } from '@/shared/ui/board/Board';
import s from '@/shared/ui/board/board.module.scss';
import { KanbanControls } from '@/features/kanban-dnd/ui/KanbanControls';

const COLUMNS = [
    { id: 'todo' as TaskStatus, label: 'Новые' },
    { id: 'in_progress' as TaskStatus, label: 'В работе' },
    { id: 'completed' as TaskStatus, label: 'Выполнено' },
    { id: 'ready_for_review' as TaskStatus, label: 'Готово' },
] as const;

export const KanbanPage = () => {
    const { projectId } = useParams<{ projectId: string }>(); 
    const project_id = Number(projectId);

    useKanbanSocket(project_id);

    const { setPageTitle, setHeaderActions, setHeaderSearch } = useOutletContext<any>();

    const tasks = useKanbanStore(state => state.tasks);
    const searchQuery = useKanbanStore(state => state.searchQuery);
    const selectedTypes = useKanbanStore(state => state.selectedTypes);
    const selectedPriorities = useKanbanStore(state => state.selectedPriorities);
    const setTasks = useKanbanStore(state => state.setTasks);
    const error = useKanbanStore(state => state.error);
    const isLoading = useKanbanStore(state => state.isLoading);
    const selectedReviewers = useKanbanStore(state => state.selectedReviewers);
    const selectedComments = useKanbanStore(state => state.selectedComments);
    const sortField = useKanbanStore(state => state.sortField);
    const sortDirection = useKanbanStore(state => state.sortDirection);

    const { projects } = useProjectStore();
    const currentProject = projects.find(p => p.id === project_id);

    const filteredTasks = useMemo(() => {
        const filtered = tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = selectedTypes.length === 0 || selectedTypes.includes(task.type);
            const matchesPriority = selectedPriorities.length === 0 || selectedPriorities.includes(task.priority);
            const matchesReviewer = selectedReviewers.length === 0 || (task.reviewer_id && selectedReviewers.includes(task.reviewer_id));
            const matchesComment = selectedComments.length === 0 || (task.comment_id && selectedComments.includes(task.comment_id));

            return matchesSearch && matchesType && matchesPriority && matchesReviewer && matchesComment;
        });

        return filtered.sort((a, b) => {
            const aVal = a[sortField] ?? '';
            const bVal = b[sortField] ?? '';
            
            const result = typeof aVal === 'string' 
                ? aVal.localeCompare(bVal as string)
                : (aVal as any) - (bVal as any);

            return sortDirection === 'asc' ? result : -result;
        });
    }, [tasks, searchQuery, selectedTypes, selectedPriorities, selectedReviewers, selectedComments, sortField, sortDirection]);

    const [activeId, setActiveId] = useState<number | null>(null);
    const isDragging = activeId !== null;

    useEffect(() => {
        if (!project_id) return;
        setTasks(project_id);
    }, []);

    useEffect(() => {
        setPageTitle(
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <IconButton size="sm">
                    <ArrowLeft size={20} />
                </IconButton>
                <span>{currentProject?.title || 'Загрузка...'}</span>
            </div>
        );
        setHeaderSearch(<KanbanControls />);
        setHeaderActions(null);
        return () => {
            setHeaderSearch(null);
            setHeaderActions(null);
        };
    }, []);

    const { activeTab, scrollToColumn, scrollContainerRef, columnsRef } = useBoardNavigation(COLUMNS);
    const { sensors, handleDragEnd } = useKanbanDnd(project_id);
    
    useMobileAutoScroll(isDragging, activeTab, COLUMNS, scrollToColumn);

    const activeTask = filteredTasks.find(t => t.id === activeId);

    if (error) {
        return <div className={s.errorWrap}><h1>{error}</h1></div>;
    }

    if (isLoading && tasks.length === 0) {
        return <div className={s.loaderWrap}><Loader /></div>;
    }
    
    return (
        <DndContext 
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={(e) => setActiveId(e.active.id as number)}
            onDragEnd={(e) => {
                handleDragEnd(e);
                setActiveId(null);
            }}
            onDragCancel={() => setActiveId(null)}
            autoScroll={false}
        >
            <Board>
                <StatusStrip 
                    columns={COLUMNS} 
                    activeTab={activeTab} 
                    onTabClick={scrollToColumn}
                />

                <BoardGrid 
                    ref={scrollContainerRef} 
                    columnsCount={COLUMNS.length}
                    className={clsx(isDragging && s.isDragging)}
                >
                    {COLUMNS.map(col => (
                        <KanbanColumn 
                            key={col.id}
                            id={col.id}
                            label={col.label}
                            tasks={filteredTasks.filter(t => t.status === col.id)}
                            innerRef={(el) => { columnsRef.current[col.id] = el; }}
                        />
                    ))}
                </BoardGrid>
            </Board>
            <DragOverlay dropAnimation={null}>
                {activeTask ? (
                    <div>
                        <TaskCard task={activeTask} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};