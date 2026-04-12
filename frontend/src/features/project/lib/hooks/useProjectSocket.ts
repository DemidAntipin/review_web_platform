import { useEffect } from 'react';
import { WebsocketService } from '@/shared/api/websocket';
import { useProjectStore } from '@/entities/project/model/project.store';

export const useProjectSocket = () => {
    const addProject = useProjectStore(state => state.addProject);
    const updateProject = useProjectStore(state => state.updateProject);
    const addMemberToStore = useProjectStore(state => state.addMemberToStore);
    const updateMemberInStore = useProjectStore(state => state.updateMemberInStore);
    const removeMemberFromStore = useProjectStore(state => state.removeMemberFromStore);

    useEffect(() => {
        const handleCreate = (payload: any) => {
            addProject({
                ...payload,
                id: payload.id,
                total_tasks_count: payload.total_tasks_count ?? 0,
                completed_tasks_count: payload.completed_tasks_count ?? 0,
                status: payload.status
            });
        };
        const handleUpdate = (payload: any) => updateProject(payload.id, payload);
        const handleMemberAdd = (payload: any) => {
            addMemberToStore({
                user_id: Number(payload.user_id),
                project_id: Number(payload.projectId),
                role: Number(payload.role),
                username: payload.username
            });
        };
        const handleMemberUpdate = (payload: any) => updateMemberInStore(Number(payload.projectId), Number(payload.user_id), Number(payload.role));
        const handleMemberRemove = (payload: any) => removeMemberFromStore(Number(payload.projectId), Number(payload.user_id));

        const unsubCreate = WebsocketService.on('PROJECT_CREATED', handleCreate);
        const unsubUpdate = WebsocketService.on('PROJECT_UPDATED', handleUpdate);
        const unsubMemberAdd = WebsocketService.on('MEMBER_ADDED', handleMemberAdd);
        const unsubMemberUpdate = WebsocketService.on('MEMBER_UPDATED', handleMemberUpdate);
        const unsubMemberRemove = WebsocketService.on('MEMBER_REMOVED', handleMemberRemove);

        return () => {
            unsubCreate();
            unsubUpdate();
            unsubMemberAdd();
            unsubMemberUpdate();
            unsubMemberRemove();
        };
    }, [addProject, updateProject, addMemberToStore, updateMemberInStore, removeMemberFromStore]);
};