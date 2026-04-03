import { MoreVertical, FlaskConical, FileText, BarChart2, Library, HelpCircle } from 'lucide-react';
import { IconButton } from '@/shared/ui/icon_button/IconButton';
import { ReviewerComment } from '../model/types';
import s from './comment-card.module.scss';
import clsx from 'clsx';
import { Button } from '@/shared/ui/button/Button';

interface CommentProps {
    comment: ReviewerComment;
}

const TYPE_CONFIG: Record<string, { icon: any, label: string }> = {
    'text_change': { icon: FileText, label: 'Правка текста' },
    'experiment': { icon: FlaskConical, label: 'Эксперимент' },
    'analysis': { icon: BarChart2, label: 'Анализ' },
    'source': { icon: Library, label: 'Источник' },
    'question': { icon: HelpCircle, label: 'Вопрос' },
};

export const ReviewerCommentCard = ({ comment }: CommentProps) => {
    const typeInfo = TYPE_CONFIG[comment.type] || { icon: FileText, label: comment.type };
    const { icon: TypeIcon, label: typeLabel } = typeInfo;

    const progressPercent = comment.tasks_count > 0 
        ? (comment.completed_tasks_count / comment.tasks_count) * 100 
        : 0;

    return (
        <div className={s.card}>
            <div className={s.cardHeader}>
                <div className={s.badges}>
                    <span className={s.labelBadge}>R{comment.reviewer_id}-C{comment.id}</span>
                    <span className={clsx(s.priorityBadge, s[comment.priority])}>
                        {comment.priority}
                    </span>
                </div>
                <IconButton size="sm"><MoreVertical size={16} /></IconButton>
            </div>
            <div className={s.commentContent}>
                {comment.content_md}
            </div>
            
            <div className={s.tagWrapper}>
                <TypeIcon size={14} /> <span>{typeLabel}</span>
            </div>
            <div className={s.progressContainer}>
                <div className={s.progressText}>
                    Прогресс: {comment.completed_tasks_count}/{comment.tasks_count} задач
                </div>
                <div className={s.progressBar}>
                    <div 
                        className={s.fill} 
                        style={{ width: `${progressPercent}%` }} 
                    />
                </div>
            </div>

            <Button variant='primary'>
                Декомпозировать
            </Button>
        </div>
    );
};