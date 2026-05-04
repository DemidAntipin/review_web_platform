import { useEffect, useMemo, useState } from "react";
import { ExportDTO, ExportFormat } from "../../model/types";
import { Field } from "@/shared/ui/field/Field";
import { Button } from "@/shared/ui/button/Button";
import { useReviewerStore } from "@/entities/reviewer/model/reviewer.store";
import { useResponseStore } from "../../model/response.store";
import s from './ExportForm.module.scss';

interface ExportFormProps {
    projectId: number;
    onSubmit: (data: ExportDTO) => void;
    onClose: () => void;
}


const FORMATS: { value: ExportFormat; label: string }[] = [
    { value: 'pdf', label: 'PDF' },
    { value: 'docx', label: 'Word (DOCX)' },
    { value: 'latex', label: 'LaTeX' }
];

export const ExportForm = ({ projectId, onSubmit, onClose }: ExportFormProps) => {
    const { reviewers, setReviewers } = useReviewerStore();
    const { selectedReviewerId, selectedCommentId, setReviewer, setComment } = useResponseStore();
    const [format, setFormat] = useState<ExportFormat>('pdf');

    useEffect(() => {
        if (projectId) {
            setReviewers(projectId);
        }
    }, [projectId, setReviewers]);

    const selectedReviewer = useMemo(() => 
        reviewers.find(r => r.id === selectedReviewerId),
    [reviewers, selectedReviewerId]);

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();
        if (selectedReviewerId && selectedCommentId && format) {
            onSubmit({
                reviewerId: selectedReviewerId,
                commentId: selectedCommentId,
                format
            });
        }
    };

    return (
        <div className={s.formContainer}>
            <form onSubmit={handleSubmit} className={s.form}>
                <div className={s.body}>
                    <Field label="Рецензент" required>
                        <select 
                            className={s.select}
                            value={selectedReviewerId ?? ''} 
                            onChange={(e) => setReviewer(e.target.value ? Number(e.target.value) : null)}
                            required
                        >
                            <option value="">Выберите рецензента...</option>
                            {reviewers.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Замечание" required>
                        <select 
                            className={s.select}
                            value={selectedCommentId ?? ''} 
                            onChange={(e) => setComment(e.target.value ? Number(e.target.value) : null)}
                            disabled={!selectedReviewerId}
                            required
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

                    <Field label="Формат" required>
                        <select 
                            className={s.select}
                            value={format} 
                            onChange={(e) => setFormat(e.target.value as ExportFormat)}
                            required
                        >
                            {FORMATS.map(f => (
                                <option key={f.value} value={f.value}>{f.label}</option>
                            ))}
                        </select>
                    </Field>
                </div>

                <footer className={s.footer}>
                    <Button variant="ghost" type="button" onClick={onClose}>
                        Отмена
                    </Button>
                    <Button 
                        variant="primary" 
                        type="submit" 
                        disabled={!(selectedReviewerId && selectedCommentId)}
                    >
                        Экспортировать
                    </Button>
                </footer>
            </form>
        </div>
    );
};