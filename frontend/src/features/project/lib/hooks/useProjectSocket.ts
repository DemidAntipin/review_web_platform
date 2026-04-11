import { useEffect } from 'react';
import { WebsocketService } from '@/shared/api/websocket';
import { useProjectStore } from '@/entities/project/model/project.store';
import { Member } from '@/entities/project/model/types';

export const useProjectSocket = () => {
    const store = useProjectStore();

    useEffect(() => {
        const unsubCreate = WebsocketService.on('PROJECT_CREATED', (payload) => {
            const projectToAdd = {
                ...payload,
                id: payload.id,
                total_tasks_count: payload.total_tasks_count ?? 0,
                completed_tasks_count: payload.completed_tasks_count ?? 0,
                status: payload.status
            };

            store.addProject(projectToAdd);
        });

        const unsubUpdate = WebsocketService.on('PROJECT_UPDATED', (payload) => {
            store.updateProject(payload.id, payload);
        });

        const unsubMemberAdd = WebsocketService.on('MEMBER_ADDED', (payload) => {
            const newMember: Member = {
                user_id: Number(payload.user_id),
                project_id: Number(payload.projectId),
                role: Number(payload.role),
                username: payload.username
            };
            store.addMemberToStore(newMember);
        });

        const unsubMemberUpdate = WebsocketService.on('MEMBER_UPDATED', (payload) => {
            store.updateMemberInStore(Number(payload.projectId), Number(payload.user_id), Number(payload.role));
        });

        const unsubMemberRemove = WebsocketService.on('MEMBER_REMOVED', (payload) => {
            store.removeMemberFromStore(Number(payload.projectId), Number(payload.user_id));
        });

        return () => {
            unsubCreate();
            unsubUpdate();
            unsubMemberAdd();
            unsubMemberUpdate();
            unsubMemberRemove();
        };
    }, [store]);
};