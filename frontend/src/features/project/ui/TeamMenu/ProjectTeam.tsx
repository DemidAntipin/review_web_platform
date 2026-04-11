import React, { useCallback, useMemo } from 'react';
import { Users, UserPlus } from 'lucide-react';
import { Button } from '@/shared/ui/button/Button';
import { Dropdown } from '@/shared/ui/dropdown/Dropdown';
import { useProjectMembers } from '@/features/project/lib/hooks/useProjectMembers';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { ROLE_MAP } from '@/shared/config/roles';
import { MemberItem } from '@/entities/project/ui/MemberItem/MemberItem';
import { TeamModals } from './TeamModals';
import s from './ProjectTeam.module.scss';

interface Props {
    projectId: number;
    triggerClassName?: string;
}

export const ProjectTeam: React.FC<Props> = ({ projectId, triggerClassName }) => {
    const { user: currentUser } = useAuthStore();
    const { members, isLoading, activeModal, selectedMember, actions, fetchMembers } = useProjectMembers(projectId);

    const handleOpenChange = useCallback((open: boolean) => {
        if (open && members.length === 0 && !isLoading) {
            fetchMembers();
        }
    }, [fetchMembers, members.length, isLoading]);

    const isPrivileged = useMemo(() => {
        const currentMember = members.find(m => m.user_id === currentUser?.id);
        return currentUser?.role === 'Админ' || ROLE_MAP[currentMember?.role as keyof typeof ROLE_MAP] === "Автор";
    }, [members, currentUser]);

    return (
        <div onClick={e => e.stopPropagation()}>
            <Dropdown onOpenChange={handleOpenChange} trigger={
                <Button variant="ghost" className={triggerClassName}>
                    <Users size={16} /> Команда
                </Button>
            }>
            <div className={s.memberList}>
                {isPrivileged && (
                    <Button variant='primary' onClick={() => actions.openModal('add')}>
                        <UserPlus size={16} /> Добавить участника
                    </Button>
                )}
                <div className={s.divider} />
                    {members.map(member => (
                    <MemberItem 
                            key={member.user_id}
                            member={member}
                            currentUserId={currentUser?.id}
                            isPrivileged={isPrivileged}
                            onEdit={() => actions.openModal('edit', member)}
                            onRemove={() => actions.openModal('remove', member)}
                            onLeave={() => actions.openModal('leave', member)}
                        />
                     ))}
                </div>
            </Dropdown>
            <TeamModals activeModal={activeModal} selectedMember={selectedMember} actions={actions} />
        </div>
    );
};