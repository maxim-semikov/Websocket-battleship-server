import { Message, MessageToClient } from './types';
import WebSocket from 'ws';

export const parseDataFromClient = (message: Message) => JSON.parse(message.data);

export const sendToClient = (ws: WebSocket, message: MessageToClient) => {
  const data = { ...message, data: JSON.stringify(message?.data), id: 0 };
  ws.send(JSON.stringify(data));
};
