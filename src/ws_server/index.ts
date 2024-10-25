import { WebSocketServer } from 'ws';
import { messageHandler } from './messageHandler';
import { randomUUID } from 'node:crypto';
import { wsClients } from './wsClients';
import { SessionId } from '../types';

const WS_PORT = 3000;

export const webSocketServer = () => {
  const wss = new WebSocketServer({
    port: WS_PORT,
  });

  wss.on('connection', (ws) => {
    const currentSessionId: SessionId = randomUUID() + '-' + new Date().getTime().toString();
    wsClients.set(currentSessionId, ws);

    ws.on('message', messageHandler(ws, currentSessionId));
  });

  console.log('Start websocket on port ', WS_PORT);
};
