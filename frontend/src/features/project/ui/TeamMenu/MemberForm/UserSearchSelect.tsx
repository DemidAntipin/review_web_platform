import React from 'react';
import { Field } from '@/shared/ui/field/Field';
import { UserSuggestion } from '@/features/project/api/member.api';
import s from './UserSearchSelect.module.scss';

interface Props {
    value: string;
    onChange: (val: string) => void;
    suggestions: UserSuggestion[];
    onSelect: (user: UserSuggestion) => void;
    placeholder?: string;
    label: string;
}

export const UserSearchSelect: React.FC<Props> = ({ 
    value, onChange, suggestions, onSelect, placeholder, label
}) => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className={s.fieldGroup}>
            <Field
                label={label}
                type="text"
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                placeholder={placeholder}
                autoComplete="off"
            />
            {isOpen && suggestions.length > 0 && (
                <ul className={s.suggestionsList}>
                    {suggestions.map((user) => (
                        <li 
                            key={user.id} 
                            className={s.suggestionItem}
                            onClick={() => {
                                onSelect(user);
                                setIsOpen(false);
                            }}
                        >
                            <span>{user.username}</span>
                            <span className={s.userTag}>ID: {user.id}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};