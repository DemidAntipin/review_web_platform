import React, { useState } from 'react';
import { Field } from '@/shared/ui/field/Field';
import s from './UserSearchSelect.module.scss';
import { ProjectPreview } from '@/entities/project/model/types';
import { ProjectSuggestion } from '@/features/project/api/member.api';

interface Props {
    value: string;
    onChange: (val: string) => void;
    suggestions: ProjectSuggestion[];
    onSelect: (project: ProjectSuggestion) => void;
    label: string;
}

export const ProjectSearchSelect: React.FC<Props> = ({ 
    value, onChange, suggestions, onSelect, label 
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={s.fieldGroup}>
            <Field
                label={label}
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                placeholder="Введите название проекта"
                autoComplete="off"
            />
            {isOpen && suggestions.length > 0 && (
                <ul className={s.suggestionsList}>
                    {suggestions.map((project) => (
                        <li 
                            key={project.id} 
                            className={s.suggestionItem}
                            onClick={() => {
                                onSelect(project);
                                setIsOpen(false);
                            }}
                        >
                            <span>{project.title}</span>
                            <span className={s.userTag}>ID: {project.id}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};