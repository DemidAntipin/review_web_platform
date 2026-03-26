import React, { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { WebsocketService } from '@/shared/api/websocket';

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const token = useAuthStore(s => s.token);

    useEffect(() => {
        if (!token) {
            WebsocketService.disconnect();
        }
    }, [token]);

    return <>{children}</>;
};