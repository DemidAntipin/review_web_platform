import React, { useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import { Field } from '@/shared/ui/field/Field';
import { wrapCyrillicInMath } from '@/shared/lib/utils/markdown';
import { EditorTabs } from './EditorTabs';
import { MarkdownPreview } from './MarkdownPreview';
import s from './MarkdownEditor.module.scss';

interface MarkdownEditorProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
}

export const MarkdownEditor = ({ label, value, onChange, placeholder, error, disabled }: MarkdownEditorProps) => {
    const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setLocalValue(e.target.value);
        onChange(e.target.value);
    };

    const handleTabChange = (tab: 'edit' | 'preview') => setActiveTab(tab);

    return (
        <Field label={label} error={error} disabled={disabled}>
            <div className={s.editorContainer}>
                <EditorTabs activeTab={activeTab} onTabChange={handleTabChange} />
                <div className={s.content}>
                    {activeTab === 'edit' ? (
                        <textarea
                            className={s.textarea}
                            value={localValue}
                            onChange={handleTextChange}
                            placeholder={placeholder}
                        />
                    ) : (
                        <MarkdownPreview value={localValue} />
                    )}
                </div>
            </div>
        </Field>
    );
};