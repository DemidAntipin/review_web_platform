import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskPreview } from '@/entities/task/model/types';
import { TaskCard } from '@/entities/task/ui/TaskCard';

interface Props {
    task: TaskPreview;
}

export const SortableTaskCard = ({ task }: Props) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        cursor: 'grab'
    };

    if (isDragging) {
        return <div ref={setNodeRef} style={{ opacity: 0 }} />;
    }
    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <TaskCard task={task} />
        </div>
    );
};