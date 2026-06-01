type WSHandler = (data: any) => void;

class WebSocketService {
    private socket: WebSocket | null = null;
    private handlers: Map<string, Set<WSHandler>> = new Map();
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private readonly RECONNECT_INTERVAL = 3000;

    connect(userId: number, token: string) {
        this.clearReconnect();

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        
        const url = `${protocol}//${host}/api/ws/${userId}?token=${token}`;

        if (this.socket?.url === url && 
            (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            return;
        }

        if (this.socket) {
            this.socket.onclose = null;
            this.socket.close();
        }

        const ws = new WebSocket(url);
        this.socket = ws;

        ws.onmessage = (event) => {
            try {
                const { event_type, project_id, payload } = JSON.parse(event.data);
                console.log(event_type, project_id, payload);
                
                const dataToHandle = { 
                    ...payload, 
                    projectId: Number(project_id)
                };

                this.handlers.get(event_type)?.forEach(handler => handler(dataToHandle));
            } catch (e) {
                console.error('Ошибка парсинга сообщения:', e);
            }
        };

        ws.onclose = () => {
            if (this.socket === ws) {
                this.socket = null;
                this.reconnectTimer = setTimeout(() => this.connect(userId, token), this.RECONNECT_INTERVAL);
            }
        };
    }

    private clearReconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    on(type: string, handler: WSHandler) {
        if (!this.handlers.has(type)) this.handlers.set(type, new Set());
        this.handlers.get(type)?.add(handler);
        return () => this.handlers.get(type)?.delete(handler);
    }

    disconnect() {
        this.clearReconnect();
        this.socket?.close();
        this.socket = null;
    }
}

export const WebsocketService = new WebSocketService();