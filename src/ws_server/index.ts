import { WebSocketServer } from 'ws';
import { messageHandler } from './messageHandler';

const WS_PORT = 3000;

export const webSocketServer = () => {
  const wss = new WebSocketServer({
    port: WS_PORT,
  });

  wss.on('connection', (ws) => {
    ws.on('message', messageHandler(ws));
  });

  console.log('Start websocket on port ', WS_PORT);
};
