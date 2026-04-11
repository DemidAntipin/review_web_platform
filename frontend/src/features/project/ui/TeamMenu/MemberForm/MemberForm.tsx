import React, { useState } from 'react';
import { Field } from '@/shared/ui/field/Field';
import { Button } from '@/shared/ui/button/Button';
import { PROJECT_ROLE_LABELS } from '@/entities/project/model/types';
import { UserSearchSelect } from './UserSearchSelect';
import { useUserSearch } from '@/features/project/lib/hooks/useUserSearch';
import s from './MemberForm.module.scss';

const AVAILABLE_ROLES = Object.entries(PROJECT_ROLE_LABELS).filter(([_, label]) => label !== 'Администратор');

interface MemberFormProps {
    initialValues?: { user_id: number; role: string | number };
    onSubmit: (data: { user_id: number; role: number }) => void;
    onCancel: () => void;
    isEdit?: boolean;
}

export const MemberForm: React.FC<MemberFormProps> = ({ initialValues, onSubmit, onCancel, isEdit }) => {
    const [userId, setUserId] = useState<number | ''>(initialValues?.user_id || '');
    const [role, setRole] = useState(initialValues?.role || '2');
    const { searchTerm, setSearchTerm, suggestions } = useUserSearch(!!isEdit);

    return (
        <form onSubmit={(e) => { e.preventDefault(); if (userId) onSubmit({ user_id: Number(userId), role: Number(role) }); }} className={s.form}>
            {!isEdit ? (
                <UserSearchSelect
                    value={searchTerm}
                    onChange={setSearchTerm}
                    suggestions={suggestions}
                    onSelect={(user) => { setUserId(user.id); setSearchTerm(user.username); }}
                />
            ) : (
                <Field label="ID Участника" value={userId} disabled />
            )}
            <Field label="Роль в проекте">
                <select value={role} onChange={(e) => setRole(e.target.value)} className={s.select}>
                    {AVAILABLE_ROLES.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
            </Field>
            <div className={s.actions}>
                <Button type="button" variant="secondary" onClick={onCancel}>Отмена</Button>
                <Button type="submit" variant="primary" disabled={!userId}>{isEdit ? 'Сохранить' : 'Добавить'}</Button>
            </div>
        </form>
    );
};