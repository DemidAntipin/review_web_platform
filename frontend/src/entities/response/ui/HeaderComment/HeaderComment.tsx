import React from 'react';
import s from './HeaderComment.module.scss';
import clsx from 'clsx';
import { ChevronRight } from 'lucide-react';
import { ReviewerComment } from '@/entities/reviewer/model/types';
import { TYPE_CONFIG } from '@/entities/reviewer/ui/ReviewerCommentCard';

interface Props {
    comment: ReviewerComment;
    className?: string;
    onClick: () => void;
}

export const SelectedCommentHeader: React.FC<Props> = ({ comment, className, onClick }) => {
    const { icon: TypeIcon, label: typeLabel } = TYPE_CONFIG[comment.type] || {};

    return (
        <div 
            className={clsx(s.card, className)} 
            onClick={onClick}
        >
            <div className={s.cardHeader}>
                <h3 className={s.title}>Замечание рецензента</h3>
                <div className={s.badges}>
                    <span className={clsx(s.priorityBadge, s[comment.priority])}>
                        {comment.priority}
                    </span>
                </div>
            </div>
            
            <div className={s.tagWrapper}>
                {TypeIcon && <TypeIcon size={14} />} 
                <span>{typeLabel}</span>
            </div>
        </div>
    );
};