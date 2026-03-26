import { Paperclip, MessageSquare, MoreVertical, FlaskConical, BarChart2, Library, HelpCircle, FileText } from 'lucide-react'
import { IconButton } from '@/shared/ui/icon_button/IconButton';
import s from './taskcard.module.scss';
import clsx from 'clsx';
import { TaskPreview, TaskType } from '../model/types';

interface TaskCardProps { task: TaskPreview; }

const TYPE_CONFIG: Record<TaskType, { icon: any, label: string }> = {
    text_change: { icon: FileText, label: 'Правка текста' },
    experiment: { icon: FlaskConical, label: 'Эксперимент' },
    analysis: { icon: BarChart2, label: 'Анализ данных' },
    source: { icon: Library, label: 'Источник' },
    question: { icon: HelpCircle, label: 'Вопрос' },
};

export const TaskCard = ({ task }: TaskCardProps) => {
    const typeInfo = TYPE_CONFIG[task.type as TaskType] || { icon: FileText, label: task.type };
    const { icon: TypeIcon, label: typeLabel } = typeInfo;
    return (
        <div className={s.card}>
            <div className={s.cardHeader}>
                <div className={s.badges}>
                    <span className={s.labelBadge}>R{task.reviewer_id}-C{task.comment_id}</span>
                    <span className={clsx(s.priorityBadge, s[task.priority])}>
                        {task.priority}
                    </span>
                </div>
                <IconButton size="sm"><MoreVertical size={16} /></IconButton>
            </div>
            
            <h3 className={s.taskTitle}>{task.title}</h3>
            
            <div className={s.tagWrapper}>
                <TypeIcon size={14} /> <span>{typeLabel}</span>
            </div>

            <div className={s.cardFooter}>
                <span className={s.username}>{task.assignee || "Нет исполнителя"}</span>
                <div className={s.stats}>
                    <div className={s.statItem}><Paperclip size={18} /> {task.attachments_count}</div>
                    <div className={s.statItem}><MessageSquare size={18} /> {task.comments_count}</div>
                </div>
            </div>
        </div>
    )
}
