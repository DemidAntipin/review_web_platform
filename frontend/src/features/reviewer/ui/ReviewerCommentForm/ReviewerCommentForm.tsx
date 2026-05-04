import React, { useState } from 'react';
import { Button } from '@/shared/ui/button/Button';
import { Field } from '@/shared/ui/field/Field';
import s from './ReviewerCommentForm.module.scss';
import { COMMENT_PRIORITY_MAP, COMMENT_TYPE_MAP, CommentPriority, CommentType, Reviewer, ReviewerComment, ReviewerCommentBase } from '@/entities/reviewer/model/types';
import { useReviewerStore } from '@/entities/reviewer/model/reviewer.store';
import { MarkdownEditor } from '@/shared/widgets/MarkdownEditor/ui/MarkdownEditor';
import { MarkdownPreview } from '@/shared/widgets/MarkdownEditor/ui/MarkdownPreview';
import { SideOverlay } from '@/shared/ui/sideoverlay/SideOverlay';
import { PRIORITY_TO_ID, TYPE_TO_ID } from '@/entities/task/model/types';

interface ReviewerCommentFormProps {
    reviewer: Reviewer;
    initialData?: ReviewerComment;
    onSubmit: (data: ReviewerCommentBase) => void;
    onClose: () => void;
}

export const ReviewerCommentForm = ({ reviewer, initialData, onSubmit, onClose }: ReviewerCommentFormProps) => {
    const [content, setContent] = useState(initialData?.content_md || '');
    const [priority, setPriority] = useState<CommentPriority>(initialData?.priority || 'Низкий' );
    const [type, setType] = useState<CommentType>(initialData?.type || 'Правка текста');
    const [showContext, setShowContext] = useState(false);

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();
        onSubmit({
            content_md: content,
            priority: PRIORITY_TO_ID[priority],
            type: TYPE_TO_ID[type],
        });
    };

    return (
        <div className={s.formContainer}>
            <SideOverlay
                isOpen={showContext}
                onToggle={() => setShowContext(!showContext)}
                title="Текст рецензии"
                className={s.overlay}
            >
                <MarkdownPreview value={reviewer.general_comment} />
            </SideOverlay>

            <form onSubmit={handleSubmit} className={s.form}>
                <div className={s.body}>
                    <div className={s.row}>
                        <Field label="Тип" required>
                            <select 
                                value={type} 
                                onChange={(e) => setType(e.target.value as CommentType)}
                                className={s.select}
                            >
                                {Object.values(COMMENT_TYPE_MAP).map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Приоритет" required>
                            <select 
                                value={priority} 
                                onChange={(e) => setPriority(e.target.value as CommentPriority)}
                                className={s.select}
                            >
                                {Object.values(COMMENT_PRIORITY_MAP).map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    <MarkdownEditor
                        label="Текст замечания"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Опишите проблему..."
                        className={s.editor}
                        required
                    />
                </div>

                <footer className={s.footer}>
                    <Button variant="ghost" type="button" onClick={onClose}>
                        Отмена
                    </Button>
                    <Button variant="primary" type="submit" disabled={!content.trim()}>
                        Добавить
                    </Button>
                </footer>
            </form>
        </div>
    );
};