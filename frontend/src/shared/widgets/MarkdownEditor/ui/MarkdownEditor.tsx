import React, { useState } from 'react';
import { Field } from '@/shared/ui/field/Field';
import { EditorTabs } from './EditorTabs';
import { MarkdownPreview } from './MarkdownPreview';
import s from './MarkdownEditor.module.scss';
import clsx from 'clsx';

interface MarkdownEditorProps extends React.InputHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    value: string;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    className?: string;
}

export const MarkdownEditor = ({ label, value, onChange, placeholder, error, disabled, className, ...props}: MarkdownEditorProps) => {
    const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

    const handleTabChange = (tab: 'edit' | 'preview') => setActiveTab(tab);

    return (
        <Field label={label} error={error} disabled={disabled} className={clsx(s.fieldHeight, className)}>
            <div className={s.editorContainer}>
                <EditorTabs activeTab={activeTab} onTabChange={handleTabChange} />
                <div className={s.content}>
                    {activeTab === 'edit' ? (
                        <textarea
                            {...props}
                            className={s.textarea}
                            value={value}
                            placeholder={placeholder}
                            onChange={onChange}
                            disabled={disabled}
                        />
                    ) : (
                        <MarkdownPreview value={value} />
                    )}
                </div>
            </div>
        </Field>
    );
};