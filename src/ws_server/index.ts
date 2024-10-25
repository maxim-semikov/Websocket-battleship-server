import WebSocket from 'ws';
import { Message } from '../types';
import { parseDataFromClient } from '../helpers';
import { handleRegistration } from '../controllers/regController';
import { getUpdatedRoomInfo } from '../controllers/roomController';

export const wsClients = new Set<WebSocket>();

function broadcastToAllClients(data: string) {
  for (const client of wsClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

export const messageHandler = (ws: WebSocket) => (rawData: WebSocket.RawData) => {
  try {
    wsClients.add(ws);
    const message: Message = JSON.parse(rawData.toString());
    console.log(`Received command "${message?.type}"`);

    switch (message?.type) {
      case 'reg': {
        const dataFromClient = parseDataFromClient(message);
        handleRegistration(ws, dataFromClient);
        broadcastToAllClients(getUpdatedRoomInfo());
        break;
      }
    }
  } catch {
    console.log('Something went wrong');
  }
};
