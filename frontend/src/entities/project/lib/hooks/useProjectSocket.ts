import { useEffect } from 'react';
import { WebsocketService } from '@/shared/api/websocket';
import { useProjectStore } from '../../model/project.store';

export const useProjectSocket = () => {
    const store = useProjectStore(); 

    useEffect(() => {
        const unsubCreate = WebsocketService.on('PROJECT_CREATED', (payload) => {
            store.addProject(payload);
        });

        const unsubUpdate = WebsocketService.on('PROJECT_UPDATED', (payload) => {
            store.updateProject(payload.id, payload);
        });

        return () => {
            unsubCreate();
            unsubUpdate();
        };
    }, []);
};