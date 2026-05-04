import { ReviewerComment } from "@/entities/reviewer/model/types";
import { PRIORITY_TO_ID, Task, TaskType, TYPE_MAP, TYPE_TO_ID } from "@/entities/task/model/types";
import { TaskForm } from "@/entities/task/ui/TaskForm/TaskForm";
import { Button } from "@/shared/ui/button/Button";
import { Dialog } from "@/shared/ui/dialog/Dialog";
import { SideOverlay } from "@/shared/ui/sideoverlay/SideOverlay";
import { MarkdownPreview } from "@/shared/widgets/MarkdownEditor/ui/MarkdownPreview";
import { Plus} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import s from './DecompositionForm.module.scss';
import { DecompositionTaskItem } from "./DecompositionTaskItem";
import { useParams } from "react-router-dom";
import { useKanbanStore } from "@/features/kanban-dnd/model/kanban.store";
import { useProjectMembers } from "@/features/project/lib/hooks/useProjectMembers";

interface DecompositionFormProps {
    reviewerComment: ReviewerComment;
    onSubmit: (tasks: Partial<Task>[]) => void;
    onCancel: () => void;
}

export const DecompositionForm = ({ reviewerComment, onSubmit, onCancel }: DecompositionFormProps) => {
    const { projectId } = useParams<{ projectId: string }>();
    const project_id = Number(projectId);
    const { members, isLoading, fetchMembers } = useProjectMembers(project_id);
    const currentTasks = useKanbanStore(state => state.tasks);
    const fetchTasks = useKanbanStore(state => state.setTasks);
    
    useEffect(() => {
        if (!project_id) return;
        fetchTasks(project_id);
    }, []);

    useEffect(() => {
        if (members.length === 0 && !isLoading) {
            fetchMembers();
        }
    }, [fetchMembers, members.length, isLoading]);

    const [showContext, setShowContext] = useState(false);

    const initialTasks = useMemo((): Partial<Task>[] => {
        return currentTasks
            .filter(t => t.comment_id === reviewerComment.id)
            .map(t => {
                const member = members.find(m => m.username === t.assignee);
                return {
                    id: t.id,
                    title: t.title,
                    type: typeof t.type === 'string' ? (TYPE_TO_ID[t.type as TaskType]) : t.type,
                    priority: typeof t.priority === 'string' ? (PRIORITY_TO_ID[t.priority]) : t.priority,
                    comment_id: t.comment_id,
                    assignee_id: member ? member.user_id : undefined 
                };
            });
    }, [currentTasks, reviewerComment.id, members]);

    const [tasks, setTasks] = useState<Partial<Task>[]>(initialTasks);

    useEffect(() => {
        if (tasks.length === 0 && initialTasks.length > 0) {
            setTasks(initialTasks);
        }
    }, [initialTasks]);

    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

    useEffect(() => {
        if (members.length > 0 && tasks.length > 0) {
            setTasks(prev => prev.map(task => {
                if (task.assignee_id) return task;

                const updatedTask = initialTasks.find(it => it.id === task.id);
                return updatedTask ? { ...task, assignee_id: updatedTask.assignee_id } : task;
            }));
        }
    }, [members, initialTasks]);

    const handleTaskSubmit = (taskData: Partial<Task>) => {
        if (editingIndex !== null) {
            setTasks(prev => prev.map((t, i) => i === editingIndex ? { ...t, ...taskData } : t));
        } else {
            setTasks(prev => [...prev, taskData]);
        }
        setIsTaskFormOpen(false);
    };

    return (
        <div className={s.container}>
            <SideOverlay isOpen={showContext} onToggle={() => setShowContext(!showContext)} title="Текст замечания" className={s.overlay}>
                <MarkdownPreview value={reviewerComment.content_md} />
            </SideOverlay>

            <div className={s.form}>
                <div className={s.taskList}>
                    {tasks.length === 0 ? (
                        <div className={s.emptyState}>Список задач пуст</div>
                    ) : (tasks.map((task, index) => (
                            <DecompositionTaskItem 
                                key={index} 
                                task={task} 
                                onEdit={() => { 
                                    setEditingIndex(index); 
                                    setIsTaskFormOpen(true); 
                                }}
                                onDelete={() => setTasks(prev => prev.filter((_, i) => i !== index))}
                            />
                        ))
                    )}
                    <Button type="button" variant="dashed" className={s.addInlineBtn} onClick={() => { setEditingIndex(null); setIsTaskFormOpen(true); }}>
                        <Plus size={16} /> Добавить задачу
                    </Button>
                </div>

                <footer className={s.footer}>
                    <Button variant="secondary" onClick={onCancel}>Отмена</Button>
                    <Button variant="primary" onClick={() => onSubmit(tasks)}>
                        Завершить декомпозицию
                    </Button>
                </footer>
            </div>

            <Dialog isOpen={isTaskFormOpen} onClose={() => setIsTaskFormOpen(false)} title={editingIndex !== null ? "Изменение задачи" : "Новая задача"}>
                <TaskForm 
                    reviewerComment={reviewerComment}
                    initialData={editingIndex !== null ? tasks[editingIndex] : undefined}
                    onSubmit={handleTaskSubmit}
                    onCancel={() => setIsTaskFormOpen(false)}
                />
            </Dialog>
        </div>
    );
};