import React, { useState } from 'react';
import { Button } from '@/shared/ui/button/Button';
import { Field } from '@/shared/ui/field/Field';
import { MarkdownEditor } from '@/shared/widgets/MarkdownEditor/ui/MarkdownEditor';
import s from './ReviewerForm.module.scss';

interface ReviewerFormValues {
    name: string;
    general_comment: string;
}

interface ReviewerFormProps {
    initialValues?: ReviewerFormValues;
    onSubmit: (data: ReviewerFormValues) => void;
    onCancel: () => void;
    submitText?: string;
    isLoading?: boolean;
}

export const ReviewerForm = ({ 
    initialValues, 
    onSubmit, 
    onCancel, 
    submitText = 'Добавить рецензента',
    isLoading 
}: ReviewerFormProps) => {
    const [name, setName] = useState(initialValues?.name || '');
    const [generalComment, setGeneralComment] = useState(initialValues?.general_comment || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSubmit({
                name: name.trim(),
                general_comment: generalComment
            });
        }
    };

    return (
        <div className={s.formContainer}>
            <form onSubmit={handleSubmit} className={s.form}>
                <div className={s.body}>
                    <Field 
                        label="Имя рецензента"
                        value={name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                        required
                        disabled={isLoading}
                    />

                    <MarkdownEditor
                        label="Рецензия"
                        value={generalComment}
                        onChange={(e) => setGeneralComment(e.target.value)}
                        placeholder="Введите текст рецензии..."
                        disabled={isLoading}
                        className={s.editor}
                    />
                
                    <footer className={s.footer}>
                        <Button variant="secondary" type="button" onClick={onCancel} disabled={isLoading}>
                            Отмена
                        </Button>
                        <Button variant="primary" type="submit" disabled={!name.trim() || isLoading}>
                            {isLoading ? 'Загрузка...' : submitText}
                        </Button>
                    </footer>
                </div>
            </form>
        </div>
    );
};