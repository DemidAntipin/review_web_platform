import { FlaskConical, FileText, BarChart2, Library, HelpCircle } from 'lucide-react';
import { ReviewerComment } from '../model/types';
import s from './comment-card.module.scss';
import clsx from 'clsx';
import { Button } from '@/shared/ui/button/Button';
import { useState } from 'react';
import { Dialog } from '@/shared/ui/dialog/Dialog';
import { Task } from '@/entities/task/model/types';
import { DecompositionForm } from '@/features/reviewer/ui/DecompositionForm/DecompositionForm';
import { useKanbanStore } from '@/features/kanban-dnd/model/kanban.store';
import { useParams } from 'react-router-dom';
import { getCommentPreview } from '@/shared/lib/utils/text';

interface CommentProps {
    comment: ReviewerComment;
    actionMenu?: React.ReactNode;
}

export const TYPE_CONFIG: Record<string, { icon: any, label: string }> = {
    'Правка текста': { icon: FileText, label: 'Правка текста' },
    'Эксперимент': { icon: FlaskConical, label: 'Эксперимент' },
    'Анализ': { icon: BarChart2, label: 'Анализ' },
    'Источник': { icon: Library, label: 'Источник' },
    'Вопрос': { icon: HelpCircle, label: 'Вопрос' },
};

export const ReviewerCommentCard = ({ comment, actionMenu }: CommentProps) => {
    const { projectId } = useParams<{ projectId: string }>();
    const project_id = Number(projectId);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const decomposeComment = useKanbanStore(state => state.decomposeComment);
    const typeInfo = TYPE_CONFIG[comment.type] || { icon: FileText, label: comment.type };
    const { icon: TypeIcon, label: typeLabel } = typeInfo;

    const progressPercent = comment.tasks_count > 0 
        ? (comment.completed_tasks_count / comment.tasks_count) * 100 
        : 0;

    const handleDecomposeSubmit = (tasks: Partial<Task>[]) => {
        decomposeComment(project_id, comment.reviewer_id, comment.id, tasks);
        setIsEditorOpen(false);
    };

    return (
        <div className={s.card}>
            <div className={s.cardHeader}>
                <div className={s.badges}>
                    <span className={s.labelBadge}>R{comment.reviewer_id}-C{comment.id}</span>
                    <span className={clsx(s.priorityBadge, s[comment.priority])}>
                        {comment.priority}
                    </span>
                </div>
                <div onClick={e => e.stopPropagation()}>
                    {actionMenu}
                </div>
            </div>
            <div className={s.commentContent}>
                {getCommentPreview(comment.content_md, 120)}
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

            <Button variant='primary' onClick={() => setIsEditorOpen(true)}>
                Декомпозировать
            </Button>

            <Dialog 
                isOpen={isEditorOpen} 
                onClose={() => setIsEditorOpen(false)} 
                title="Декомпозиция комментария"
            >
                <DecompositionForm
                    key={comment.id}
                    onSubmit={handleDecomposeSubmit}
                    onCancel={() => setIsEditorOpen(false)} 
                    reviewerComment={comment} />
            </Dialog>
        </div>
    );
};
