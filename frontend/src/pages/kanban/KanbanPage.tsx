import { useState } from 'react';
import { DndContext, closestCorners, DragOverlay } from '@dnd-kit/core';
import { KanbanColumn } from './KanbanColumn';
import { useKanbanDnd } from '@/features/kanban-dnd/lib/hooks/useKanbanDnd';
import { Task } from '@/entities/task/model/types';
import { StatusStrip } from './StatusStrip';
import { useKanbanNavigation } from '@/features/kanban-dnd/lib/hooks/useKanbanNavigation';
import { useMobileAutoScroll } from '@/features/kanban-dnd/lib/hooks/useMobileAutoScroll';
import s from './kanban.module.scss';
import { TaskCard } from '@/entities/task/ui/TaskCard';
import clsx from 'clsx';

const COLUMNS = [
    { id: 'new', label: 'Новые' },
    { id: 'in_progress', label: 'В работе' },
    { id: 'completed', label: 'Выполнено' },
    { id: 'ready', label: 'Готово' }
];

export const KanbanPage = () => {
    const [tasks, setTasks] = useState<Task[]>([
        {
            id: '1',
            label: 'R1-C1',
            priority: 'medium',
            title: 'Тестовая задача',
            type: 'Эксперимент',
            username: 'Demid23',
            attachments: 5,
            comments: 42,
            status: 'ready',
        },
        {
            id: '2',
            label: 'R1-C1',
            priority: 'medium',
            title: 'Тестовая задача',
            type: 'Эксперимент',
            username: 'Demid23',
            attachments: 5,
            comments: 42,
            status: 'in_progress',
        },
        {
            id: '3',
            label: 'R1-C1',
            priority: 'medium',
            title: 'Тестовая задача',
            type: 'Эксперимент',
            username: 'Demid23',
            attachments: 5,
            comments: 42,
            status: 'in_progress',
        },
        {
            id: '4',
            label: 'R1-C1',
            priority: 'medium',
            title: 'Тестовая задача',
            type: 'Эксперимент',
            username: 'Demid23',
            attachments: 5,
            comments: 42,
            status: 'new',
        },
        {
            id: '5',
            label: 'R1-C1',
            priority: 'medium',
            title: 'Тестовая задача',
            type: 'Эксперимент',
            username: 'Demid23',
            attachments: 5,
            comments: 42,
            status: 'in_progress',
        },
        {
            id: '6',
            label: 'R1-C1',
            priority: 'medium',
            title: 'Тестовая задача',
            type: 'Эксперимент',
            username: 'Demid23',
            attachments: 5,
            comments: 42,
            status: 'ready',
        },
        {
            id: '7',
            label: 'R2-C1',
            priority: 'high',
            title: 'Тестовая задача',
            type: 'Эксперимент',
            username: 'Demid23',
            attachments: 5,
            comments: 42,
            status: 'in_progress',
        }
    ])
    const [isDragging, setIsDragging] = useState(false);

    const { activeTab, scrollToColumn, scrollContainerRef, columnsRef } = useKanbanNavigation(COLUMNS);
    const { sensors, handleDragEnd } = useKanbanDnd(tasks, setTasks);
    useMobileAutoScroll(isDragging, activeTab, COLUMNS, scrollToColumn);
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    return (
        <DndContext 
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={(e) => {
                const task = tasks.find(t => t.id === e.active.id);
                setActiveTask(task ?? null);
                setIsDragging(true);
            }}
            onDragEnd={(e) => {
                setActiveTask(null);
                setIsDragging(false);
                handleDragEnd(e);
            }}
            onDragCancel={() => setIsDragging(false)}
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
                            id={col.id}
                            label={col.label}
                            tasks={tasks.filter(t => t.status === col.id)}
                            innerRef={(el) => { columnsRef.current[col.id] = el; }}
                        />
                    ))}
                </div>
            </div>
            <DragOverlay>
                {activeTask ? <TaskCard task={activeTask} /> : null}
            </DragOverlay>
        </DndContext>
    );
};