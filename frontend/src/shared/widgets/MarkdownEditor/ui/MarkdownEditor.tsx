import React, { useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import { Field } from '@/shared/ui/field/Field';
import { wrapCyrillicInMath } from '@/shared/lib/utils/markdown';
import { EditorTabs } from './EditorTabs';
import { MarkdownPreview } from './MarkdownPreview';
import s from './MarkdownEditor.module.scss';

interface MarkdownEditorProps extends React.InputHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    value: string;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
}

export const MarkdownEditor = ({ label, value, onChange, placeholder, error, disabled, ...props}: MarkdownEditorProps) => {
    const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

    const handleTabChange = (tab: 'edit' | 'preview') => setActiveTab(tab);

    return (
        <Field label={label} error={error} disabled={disabled}>
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