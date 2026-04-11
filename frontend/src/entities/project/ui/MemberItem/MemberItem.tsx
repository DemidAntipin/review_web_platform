import React from 'react';
import { Pencil, Trash2, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { Member, PROJECT_ROLE_LABELS } from '../../model/types';
import s from './MemberItem.module.scss';
import { Button } from '@/shared/ui/button/Button';

interface MemberItemProps {
    member: Member;
    currentUserId?: number;
    isPrivileged: boolean;
    onEdit?: (member: Member) => void;
    onRemove?: (member: Member) => void;
    onLeave?: (member: Member) => void;
}

export const MemberItem: React.FC<MemberItemProps> = ({ 
    member, currentUserId, isPrivileged, onEdit, onRemove, onLeave 
}) => {
    const isSelf = member.user_id === currentUserId;

    return (
        <div className={s.memberItem}>
            <div className={s.memberInfo}>
                <span className={s.username}>{member.username}</span>
                <span className={s.role}>
                    {PROJECT_ROLE_LABELS[member.role] || member.role}
                </span>
            </div>

            <div className={s.actions}>
                {isPrivileged && !isSelf && onEdit && (
                    <Button className={s.actionBtn} onClick={() => onEdit(member)}>
                        <Pencil size={15} />
                    </Button>
                )}

                {isSelf && onLeave ? (
                    <Button className={clsx(s.actionBtn, s.dangerBtn)} onClick={() => onLeave(member)}>
                        <LogOut size={15} />
                    </Button>
                ) : (isPrivileged && onRemove) ? (
                    <Button className={clsx(s.actionBtn, s.dangerBtn)} onClick={() => onRemove(member)}>
                        <Trash2 size={15} />
                    </Button>
                ) : null}
            </div>
        </div>
    );
};