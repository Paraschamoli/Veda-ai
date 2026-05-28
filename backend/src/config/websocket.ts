import { WebSocketServer, WebSocket } from 'ws';

let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

export const initWebSocket = (server: any) => {
  wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request: any, socket: any, head: any) => {
    wss?.handleUpgrade(request, socket, head, (ws) => {
      wss?.emit('connection', ws, request);
    });
  });

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('🔌 Client connected to WebSocket.');

    ws.send(JSON.stringify({ type: 'STATUS', message: 'Connected to generation feedback stream' }));

    ws.on('close', () => {
      clients.delete(ws);
      console.log('🔌 Client disconnected.');
    });
  });
};

export const broadcast = (data: any) => {
  const messageStr = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
};
