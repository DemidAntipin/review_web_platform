import React, { useEffect, useMemo } from 'react';
import { useReviewerStore } from '@/entities/reviewer/model/reviewer.store';
import { useResponseStore } from '@/entities/response/model/response.store';
import s from './ResponseHeader.module.scss';
import { Field } from '@/shared/ui/field/Field';
import clsx from 'clsx';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
    projectId: number;
}

export const ResponseHeader: React.FC<Props> = ({ projectId }) => {
    const { reviewers, setReviewers } = useReviewerStore();
    
    useEffect(() => {
        if (!projectId) return;
        setReviewers(projectId);
    }, []);

    const { selectedReviewerId, selectedCommentId, setReviewer, setComment, fetchResponse, isLoading, currentResponse } = useResponseStore();

    const selectedReviewer = useMemo(() => 
        reviewers.find(r => r.id === selectedReviewerId),
    [reviewers, selectedReviewerId]);

    const handleReviewerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value ? Number(e.target.value) : null;
        setReviewer(val);
    };

    const handleCommentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value ? Number(e.target.value) : null;
        setComment(val);
        
        if (selectedReviewerId && val) {
            fetchResponse(projectId, selectedReviewerId, val);
        }
    };

    return (
        <div className={s.selectorsContainer}>
            <Field label="Рецензент">
                <select 
                    value={selectedReviewerId ?? ''} 
                    onChange={handleReviewerChange}
                >
                    <option value="">Выберите рецензента...</option>
                    {reviewers.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                </select>
            </Field>

            <Field label="Замечание">
                <select 
                    value={selectedCommentId ?? ''} 
                    onChange={handleCommentChange}
                    disabled={!selectedReviewerId || isLoading}
                >
                    <option value="">
                        {selectedReviewerId ? "Выберите замечание..." : "Сначала выберите рецензента"}
                    </option>
                    {selectedReviewer?.comments.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.content_md.length > 50 ? `${c.content_md.slice(0, 50)}...` : c.content_md}
                        </option>
                    ))}
                </select>
            </Field>
            {selectedCommentId && (
                <div className={clsx(s.statusBadge, currentResponse?.approved ? s.approved : s.pending)}>
                    <span>{currentResponse?.approved ? 'Одобрено' : 'На оценке'}</span>
                </div>
            )}
        </div>
    );
};