import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task } from '@/entities/task/model/types';
import { SortableTaskCard } from '@/features/kanban-dnd/ui/SortableTaskCard';
import s from './kanban.module.scss';
import clsx from 'clsx';

interface Props {
    id: string;
    label: string;
    tasks: Task[];
    innerRef?: (el: HTMLDivElement | null) => void;
}

export const KanbanColumn = ({ id, label, tasks, innerRef }: Props) => {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div 
            ref={(el) => {
                setNodeRef(el);
                if (innerRef) innerRef(el);
            }} 
            className={s.column}
            data-id={id}
        >
            <h2 className={s.columnTitle}>{label}</h2>
            <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className={s.taskList}>
                    {tasks.map(task => <SortableTaskCard key={task.id} task={task} />)}
                </div>
            </SortableContext>
        </div>
    );
};