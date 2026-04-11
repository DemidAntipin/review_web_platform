import React from 'react';
import { Button } from '@/shared/ui/button/Button';
import { Field } from '@/shared/ui/field/Field';
import s from './ProjectForm.module.scss';

export interface ProjectFormValues {
    title: string;
    journal: string;
    deadline: string;
}

interface ProjectFormProps {
    initialValues?: ProjectFormValues;
    onSubmit: (values: ProjectFormValues) => void;
    onCancel: () => void;
    isLoading?: boolean;
    submitText?: string;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ 
    initialValues, onSubmit, onCancel, isLoading, submitText = 'Сохранить' 
}) => {
    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        onSubmit({
            title: formData.get('title') as string,
            journal: formData.get('journal') as string,
            deadline: formData.get('deadline') as string,
        });
    };

    return (
        <form onSubmit={handleSubmit} className={s.form}>
            <Field label="Название" name="title" defaultValue={initialValues?.title} required />
            <Field label="Журнал" name="journal" defaultValue={initialValues?.journal} required />
            <Field 
                className={s.dateInput}
                label="Дедлайн" 
                name="deadline" 
                type="date"
                defaultValue={initialValues?.deadline?.substring(0, 10)}
                required 
            />
            <div className={s.actions}>
                <Button variant="secondary" type="button" onClick={onCancel} disabled={isLoading}>Отмена</Button>
                <Button variant="primary" type="submit" disabled={isLoading}>
                    {isLoading ? 'Загрузка...' : submitText}
                </Button>
            </div>
        </form>
    );
};