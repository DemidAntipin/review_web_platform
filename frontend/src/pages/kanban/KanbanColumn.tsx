import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskPreview, TaskStatus } from '@/entities/task/model/types';
import { BoardColumn } from '@/shared/ui/board/BoardColumn';
import { SortableTaskCard } from '@/features/kanban-dnd/ui/SortableTaskCard';

interface Props {
    id: TaskStatus;
    label: string;
    tasks: TaskPreview[];
    innerRef?: (el: HTMLDivElement | null) => void;
}

export const KanbanColumn = ({ id, label, tasks, innerRef }: Props) => {
    const { setNodeRef } = useDroppable({ id });

    return (
        <BoardColumn 
            label={label}
            data-id={id}
            ref={(el) => {
                setNodeRef(el);
                if (innerRef) innerRef(el);
            }}
        >
            <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                {tasks.map(task => <SortableTaskCard key={task.id} task={task} />)}
            </SortableContext>
        </BoardColumn>
    );
};