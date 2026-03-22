import { Paperclip, MessageSquare, MoreVertical, FlaskConical } from 'lucide-react';
import { IconButton } from '@/shared/ui/icon_button/IconButton';
import s from './taskcard.module.scss';
import clsx from 'clsx';
import { Task } from '../model/types';

interface TaskCardProps { task: Task; }

export const TaskCard = ({ task }: TaskCardProps) => (
    <div className={s.card}>
        <div className={s.cardHeader}>
            <div className={s.badges}>
                <span className={s.labelBadge}>{task.label}</span>
                <span className={clsx(s.priorityBadge, s[task.priority])}>
                    {task.priority}
                </span>
            </div>
            <IconButton size="sm"><MoreVertical size={16} /></IconButton>
        </div>
        
        <h3 className={s.taskTitle}>{task.title}</h3>
        
        <div className={s.tagWrapper}>
            <FlaskConical size={14} /> <span>{task.type}</span>
        </div>

        <div className={s.cardFooter}>
            <span className={s.username}>{task.username}</span>
            <div className={s.stats}>
                <div className={s.statItem}><Paperclip size={18} /> {task.attachments}</div>
                <div className={s.statItem}><MessageSquare size={18} /> {task.comments}</div>
            </div>
        </div>
    </div>
);