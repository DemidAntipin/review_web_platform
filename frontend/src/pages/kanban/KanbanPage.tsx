import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { DndContext, closestCorners, pointerWithin, DragOverlay } from '@dnd-kit/core';
import { KanbanColumn } from './KanbanColumn';
import { useKanbanStore } from '@/features/kanban-dnd/model/kanban.store';
import { useKanbanDnd } from '@/features/kanban-dnd/lib/hooks/useKanbanDnd';
import { StatusStrip } from './StatusStrip';
import { useKanbanNavigation } from '@/features/kanban-dnd/lib/hooks/useKanbanNavigation';
import { useMobileAutoScroll } from '@/features/kanban-dnd/lib/hooks/useMobileAutoScroll';
import { Loader } from '@/shared/ui/loader/Loader';
import s from './kanban.module.scss';
import { TaskCard } from '@/entities/task/ui/TaskCard';
import clsx from 'clsx';
import { STATUS_MAP, TaskStatus } from '@/entities/task/model/types';
import { useProjectStore } from '@/entities/project/model/project.store';
import { useKanbanSocket } from '@/features/kanban-dnd/lib/hooks/useKanbanSocket';
import { IconButton } from '@/shared/ui/icon_button/IconButton';
import { ArrowLeft } from 'lucide-react';

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

    const { setPageTitle, setHeaderActions } = useOutletContext<any>();
    const { tasks, isLoading, error, setTasks} = useKanbanStore();
    const { projects } = useProjectStore();
    const currentProject = projects.find(p => p.id === project_id);

    const [activeId, setActiveId] = useState<number | null>(null);
    const isDragging = activeId !== null;

    useEffect(() => {
        if (!project_id) return;

        setTasks(project_id);
        setPageTitle(
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <IconButton size="sm">
                    <ArrowLeft size={20} />
                </IconButton>
                <span>{currentProject?.title || 'Загрузка...'}</span>
            </div>
        );
        setHeaderActions();


        return () => {
            setHeaderActions(null);
            setPageTitle('');
        };
    }, [project_id, currentProject, setTasks, setPageTitle, setHeaderActions]);

    const { activeTab, scrollToColumn, scrollContainerRef, columnsRef } = useKanbanNavigation(COLUMNS);
    const { sensors, handleDragEnd } = useKanbanDnd(project_id);
    
    useMobileAutoScroll(isDragging, activeTab, COLUMNS, scrollToColumn);

    const activeTask = tasks.find(t => t.id === activeId);

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
            <div className={s.container}>
                <StatusStrip 
                    columns={COLUMNS} 
                    activeTab={activeTab} 
                    onTabClick={scrollToColumn}
                />

                <div className={clsx(s.boardGrid, isDragging && s.isDragging)} ref={scrollContainerRef}>
                    {COLUMNS.map(col => (
                        <KanbanColumn 
                            key={col.id}
                            id={col.id} // Передается 'todo', 'in_progress' и т.д.
                            label={col.label}
                            tasks={tasks.filter(t => t.status === col.id)}
                            innerRef={(el) => { columnsRef.current[col.id] = el; }}
                        />
                    ))}
                </div>
            </div>

            <DragOverlay dropAnimation={null}>
                {activeTask ? (
                    <div className={s.dragOverlayItem}>
                        <TaskCard task={activeTask} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};