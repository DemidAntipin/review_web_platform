import { Paperclip, MessageSquare, MoreVertical, FlaskConical, BarChart2, Library, HelpCircle, FileText } from 'lucide-react'
import { IconButton } from '@/shared/ui/icon_button/IconButton';
import s from './taskcard.module.scss';
import clsx from 'clsx';
import { TaskPreview, TaskType } from '../model/types';
import { TaskComments } from '@/features/task_comment/ui/TaskComment';
import { Dropdown } from '@/shared/ui/dropdown/Dropdown';
import { useParams } from 'react-router-dom';
import { Button } from '@/shared/ui/button/Button';
import { AttachmentList } from '@/features/attachments/ui/AttachmentList';
import { useRef } from 'react';

interface TaskCardProps { 
    task: TaskPreview;
    actionMenu?: React.ReactNode;
    onClick?: () => void;
}

const TYPE_CONFIG: Record<TaskType, { icon: any, label: string }> = {
    "Правка текста": { icon: FileText, label: 'Правка текста' },
    Эксперимент: { icon: FlaskConical, label: 'Эксперимент' },
    Анализ: { icon: BarChart2, label: 'Анализ данных' },
    Источник: { icon: Library, label: 'Источник' },
    Вопрос: { icon: HelpCircle, label: 'Вопрос' },
};

export const TaskCard = ({ task, actionMenu, onClick }: TaskCardProps) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const { projectId } = useParams<{ projectId: string }>(); 
    const project_id = Number(projectId);
    const typeInfo = TYPE_CONFIG[task.type as TaskType] || { icon: FileText, label: task.type };
    const { icon: TypeIcon, label: typeLabel } = typeInfo;
    return (
        <div className={s.card} ref={cardRef} onClick={onClick}>
            <div className={s.cardHeader}>
                <div className={s.badges}>
                    <span className={s.labelBadge}>R{task.reviewer_id}-C{task.comment_id}</span>
                    <span className={clsx(s.priorityBadge, s[task.priority])}>
                        {task.priority}
                    </span>
                </div>
                <div onClick={e => e.stopPropagation()}>
                    {actionMenu}
                </div>
            </div>
            
            <h3 className={s.taskTitle}>{task.title}</h3>
            
            <div className={s.tagWrapper}>
                <TypeIcon size={14} /> <span>{typeLabel}</span>
            </div>

            <div className={s.cardFooter}>
                <span className={s.username}>{task.assignee || "Нет исполнителя"}</span>
                <div className={s.stats} onClick={(e) => e.stopPropagation()}>
                    <Dropdown 
                        position="bottom"
                        containerRef={cardRef}
                        trigger={
                            <Button className={s.statItem} variant='ghost'>
                                <Paperclip size={18} /> {task.attachments_count}
                            </Button>
                        }>
                        <AttachmentList projectId={project_id} taskId={task.id} />
                    </Dropdown>
                    <Dropdown 
                        position="bottom"
                        containerRef={cardRef}
                        trigger={
                            <Button className={s.statItem} variant='ghost'>
                                <MessageSquare size={18} /> {task.comments_count}
                            </Button>
                        }
                    >
                        <TaskComments projectId={project_id} taskId={task.id} />
                    </Dropdown>
                </div>
            </div>
        </div>
    )
}
