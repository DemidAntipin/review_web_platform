import { useState, useCallback, useMemo, useEffect } from 'react';
import { Member, MemberModalType } from '@/entities/project/model/types';
import { projectMemberApi } from '../../api/member.api';
import { useProjectStore } from '@/entities/project/model/project.store';

const EMPTY_MEMBERS: Member[] = [];

export const useProjectMembers = (projectId: number) => {
    const removeProjectMembers = useProjectStore(state => state.removeProjectMembers);
    const members = useProjectStore(state => state.projectMembers[projectId] || EMPTY_MEMBERS);
    const setMembers = useProjectStore(state => state.setMembers);
    const [isLoading, setIsLoading] = useState(false);
    const [activeModal, setActiveModal] = useState<MemberModalType>(null);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);

    const fetchMembers = useCallback(async () => {   
        setIsLoading(true);
        try {
            const { data } = await projectMemberApi.list(projectId);
            setMembers(projectId, data);
        } catch (e) {
            console.error("Ошибка при загрузке участников:", e);
        } finally {
            setIsLoading(false);
        }

    }, [projectId, setMembers]);

    useEffect(() => {
        return () => {
            removeProjectMembers(projectId);
        };
    }, [projectId, removeProjectMembers]);

    const closeModal = useCallback(() => {
        setActiveModal(null);
        setSelectedMember(null);
    }, []);

    const openModal = useCallback((type: MemberModalType, member: Member | null = null) => {
        setSelectedMember(member);
        setActiveModal(type);
    }, []);

    const actions = useMemo(() => ({
        addMember: async (dto: { user_id: number, role: number }) => {
            await projectMemberApi.add(projectId, dto);
            closeModal();
        },
        updateMember: async (role: number) => {
            if (selectedMember) {
                await projectMemberApi.update(projectId, selectedMember.user_id, role);
                closeModal();
            }
        },
        removeMember: async () => {
            if (selectedMember) {
                await projectMemberApi.remove(projectId, selectedMember.user_id);
                closeModal();
            }
        },
        leaveProject: async () => {
            await projectMemberApi.leave(projectId);
            closeModal();
        },
        fetchMembers,
        openModal,
        closeModal
    }), [projectId, fetchMembers, openModal, closeModal, selectedMember]);

    return { members, isLoading, activeModal, selectedMember, actions, fetchMembers };
};