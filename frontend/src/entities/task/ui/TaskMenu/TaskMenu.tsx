import React, { useMemo, useState } from "react";
import { useKanbanStore } from "@/features/kanban-dnd/model/kanban.store";
import { PRIORITY_TO_ID, STATUS_TO_ID, TaskPreview, TaskPriority, TaskStatus, TaskType, TYPE_TO_ID } from "@/entities/task/model/types";
import { Dropdown } from "@/shared/ui/dropdown/Dropdown";
import { IconButton } from "@/shared/ui/icon_button/IconButton";
import { Edit2, Eye, EyeOff, MoreVertical, Trash2 } from "lucide-react";
import { Dialog } from "@/shared/ui/dialog/Dialog";
import { TaskForm } from "../TaskForm/TaskForm";
import { Button } from "@/shared/ui/button/Button";
import { ReviewerComment } from "@/entities/reviewer/model/types";
import clsx from "clsx";
import s from './TaskMenu.module.scss';
import { useReviewerStore } from "@/entities/reviewer/model/reviewer.store";
import { useAuthStore } from "@/features/auth/model/auth.store";
import { useProjectMembers } from "@/features/project/lib/hooks/useProjectMembers";
import { ROLE_MAP } from "@/shared/config/roles";
import { useParams } from "react-router-dom";
import { taskApi } from "../../api/task.api";
import { ENDPOINTS } from "@/shared/api/endpoints";

interface TaskMenuProps {
    task: TaskPreview;
}

export const TaskMenu: React.FC<TaskMenuProps> = ({ task }) => {
    const { projectId } = useParams<{ projectId: string }>();
    const project_id = Number(projectId);
    const [activeModal, setActiveModal] = useState<'edit' | 'delete' | null>(null);
    const removeTask = useKanbanStore(state => state.removeTask);
    const updateTask = useKanbanStore(state => state.updateTask);
    const toggleTaskHide = useKanbanStore(state => state.toggleTaskHide);
    const hiddenTasksIds = useKanbanStore(state => state.hiddenTasksIds);

    const reviewers = useReviewerStore(state => state.reviewers);
    const reviewerComment = useMemo(() => {
        for (const r of reviewers) {
            const found = r.comments.find(c => c.id === task.comment_id);
            if (found) return found;
        }
        return undefined;
    }, [reviewers, task.comment_id]);

    const { user: currentUser } = useAuthStore();
    const { members } = useProjectMembers(project_id);
        
    const isHidden = hiddenTasksIds.has(task.id);
    
    const isPrivileged = useMemo(() => {
        const currentMember = members.find(m => m.user_id === currentUser?.id);
        return currentUser?.role === 'Админ' || ROLE_MAP[currentMember?.role as keyof typeof ROLE_MAP] === "Автор";
    }, [members, currentUser]);

    const taskInitialData = useMemo(() => ({
        ...task,
        type: TYPE_TO_ID[task.type as TaskType],
        priority: PRIORITY_TO_ID[task.priority as TaskPriority],
        status: STATUS_TO_ID[task.status as TaskStatus],
    }), [task]);

    const handleDelete = () => {
        taskApi.delete(project_id, task.id)
        setActiveModal(null);
    };

    const handleUpdate = (data: any) => {
        taskApi.update(project_id, task.id, data)
        setActiveModal(null);
    };

    return (
        <div onClick={e => e.stopPropagation()}>
            <Dropdown trigger={
                <IconButton size="sm">
                    <MoreVertical size={18} />
                </IconButton>
            }>
                <div className={s.menuList}>
                    <button className={s.menuItem} onClick={() => toggleTaskHide(task.id)}>
                        {isHidden ? <Eye size={14} /> : <EyeOff size={14} />}
                        {isHidden ? 'Показать' : 'Скрыть'}
                    </button>

                    {isPrivileged && (
                        <>
                            <button className={s.menuItem} onClick={() => setActiveModal('edit')}>
                                <Edit2 size={14} /> Редактировать
                            </button>
                            <button className={clsx(s.menuItem, s.danger)} onClick={() => setActiveModal('delete')}>
                                <Trash2 size={14} /> Удалить
                            </button>
                        </>
                    )}
                </div>
            </Dropdown>

            <Dialog 
                isOpen={activeModal === 'edit'} 
                onClose={() => setActiveModal(null)} 
                title="Редактировать задачу"
            >
                <TaskForm 
                    initialData={taskInitialData}
                    reviewerComment={reviewerComment!} 
                    onSubmit={handleUpdate}
                    onCancel={() => setActiveModal(null)}
                />
            </Dialog>

            <Dialog 
                isOpen={activeModal === 'delete'} 
                onClose={() => setActiveModal(null)} 
                title="Удалить задачу"
            >
                <div className={s.confirmContent}>
                    <p>Вы действительно хотите удалить задачу <strong>{task.title}</strong>?</p>
                    <div className={s.actions}>
                        <Button variant="secondary" onClick={() => setActiveModal(null)}>
                            Отмена
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Удалить
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};