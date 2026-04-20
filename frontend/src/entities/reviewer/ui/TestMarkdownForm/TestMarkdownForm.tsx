import React, { useState } from 'react';
import { Button } from '@/shared/ui/button/Button';
import { MarkdownEditor } from '@/shared/widgets/MarkdownEditor/ui/MarkdownEditor';
import s from './TestMarkdownForm.module.scss';

interface TestFormProps {
    onSubmit: (content: string) => void;
    onCancel: () => void;
}

export const TestMarkdownForm = ({ onSubmit, onCancel }: TestFormProps) => {
    const [content, setContent] = useState('### Тестовый заголовок\n\nПример формулы: $E=mc^2$');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(content);
    };

    return (
        <form onSubmit={handleSubmit} className={s.form}>
            <MarkdownEditor
                label="Содержимое задачи (Markdown + LaTeX)"
                value={content}
                onChange={setContent}
                placeholder="Введите описание задачи..."
            />
            
            <div className={s.actions}>
                <Button variant="secondary" type="button" onClick={onCancel}>
                    Отмена
                </Button>
                <Button variant="primary" type="submit">
                    Сохранить задачу
                </Button>
            </div>
        </form>
    );
};