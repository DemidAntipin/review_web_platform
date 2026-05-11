import { useEffect } from 'react';
import { WebsocketService } from '@/shared/api/websocket';
import { useResponseStore } from '../../model/response.store';

export const useResponseSocket = (commentId: number | null) => {
    const applyExternalUpdate = useResponseStore((state) => state.applyExternalUpdate);

    useEffect(() => {
        if (!commentId) return;

        const handleUpdate = (payload: any) => {
            applyExternalUpdate(payload);
        };

        const unsubscribeSave = WebsocketService.on('RESPONSE_SAVED', handleUpdate);
        const unsubscribeApprove = WebsocketService.on('RESPONSE_APPROVED', handleUpdate);

        return () => {
            unsubscribeSave();
            unsubscribeApprove();
        };
    }, [commentId, applyExternalUpdate]);
};