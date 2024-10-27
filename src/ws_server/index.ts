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
    console.warn('New client connected. Session id: ', currentSessionId);

    wsClients.set(currentSessionId, ws);

    ws.on('message', messageHandler(ws, currentSessionId));

    ws.on('close', () => {
      wsClients.delete(currentSessionId);
      console.warn(`Client with session id: ${currentSessionId} was disconnected`);
    });
  });

  console.log('Start websocket on port ', WS_PORT);
};
