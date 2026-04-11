type WSHandler = (data: any) => void;

class WebSocketService {
    private socket: WebSocket | null = null;
    private handlers: Map<string, Set<WSHandler>> = new Map();

    connect(userId: number, token: string) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        
        const url = `${protocol}//${host}/api/ws/${userId}?token=${token}`;

        if (this.socket?.url === url && this.socket.readyState === WebSocket.OPEN) {
            return;
        }

        if (this.socket) {
            this.socket.close();
        }

        this.socket = new WebSocket(url);

        this.socket.onmessage = (event) => {
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

        this.socket.onclose = () => {
            this.socket = null;
        };
    }

    on(type: string, handler: WSHandler) {
        if (!this.handlers.has(type)) this.handlers.set(type, new Set());
        this.handlers.get(type)?.add(handler);
        return () => this.handlers.get(type)?.delete(handler);
    }

    disconnect() {
        this.socket?.close();
        this.socket = null;
    }
}

export const WebsocketService = new WebSocketService();