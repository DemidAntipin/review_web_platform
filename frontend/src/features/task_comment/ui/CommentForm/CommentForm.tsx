import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { IconButton } from '@/shared/ui/icon_button/IconButton';
import s from './CommentForm.module.scss';

interface CommentFormProps {
    onSend: (text: string) => Promise<boolean>;
    disabled?: boolean;
}

export const CommentForm: React.FC<CommentFormProps> = ({ onSend, disabled }) => {
    const [text, setText] = useState('');

    const handleSubmit = async () => {
        if (!text.trim()) return;
        const success = await onSend(text.trim());
        if (success) setText('');
    };

    return (
        <div className={s.inputWrapper}>
            <textarea
                className={s.textarea}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSubmit())}
                placeholder="Введите коментарий..."
                rows={1}
            />
            <IconButton onClick={handleSubmit} disabled={disabled || !text.trim()}>
                <Send size={20} />
            </IconButton>
        </div>
    );
};