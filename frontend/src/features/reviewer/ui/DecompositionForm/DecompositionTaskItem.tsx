import { Task, TYPE_MAP } from "@/entities/task/model/types";
import { IconButton } from "@/shared/ui/icon_button/IconButton";
import clsx from "clsx";
import { Edit2, Trash2, User } from "lucide-react";
import s from './DecompositionForm.module.scss';
import { useParams } from "react-router-dom";
import { useProjectMembers } from "@/features/project/lib/hooks/useProjectMembers";
import { useCallback, useEffect } from "react";

export const DecompositionTaskItem = ({ task, onEdit, onDelete }: { 
    task: Partial<Task>, 
    onEdit: () => void, 
    onDelete: () => void 
}) => {
    
    const { projectId } = useParams<{ projectId: string }>(); 
    const project_id = Number(projectId);

    const { members } = useProjectMembers(project_id);

    const assignee = members.find(m => m.user_id === Number(task.assignee_id));

    return (
    <div className={s.taskItem}>
        <div className={s.taskMain}>
            <div className={s.taskContent}>
                <span className={s.taskTitle}>{task.title}</span>
                <div className={s.taskMeta}>
                    <span className={s.taskTypeTag}>
                        {TYPE_MAP[task.type as number] || 'Задача'}
                    </span>
                    <span className={s.taskAssignee}>
                        <User size={12} className={s.assigneeIcon} />
                        {assignee? assignee.username : "Нет исполнителя"}
                    </span>
                </div>
            </div>
        </div>
        <div className={s.actions}>
            <IconButton onClick={onEdit} variant='ghost'><Edit2 size={14} /></IconButton>
            <IconButton onClick={onDelete} variant="danger"><Trash2 size={14} /></IconButton>
        </div>
    </div>
)};