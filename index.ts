import { WebSocketServer } from 'ws';
import { httpServer } from './src/http_server';
import { messageHandler } from './src/ws_server';

const HTTP_PORT = 8181;
const WS_PORT = 3000;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

export const webSocketServer = new WebSocketServer({
  port: WS_PORT,
});

webSocketServer.on('connection', (ws) => {
  console.log('Start websocket on port ', WS_PORT);

  ws.on('message', messageHandler(ws));
});
