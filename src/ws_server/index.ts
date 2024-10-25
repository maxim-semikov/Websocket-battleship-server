import WebSocket from 'ws';
import { Message } from '../types';
import { parseDataFromClient } from '../helpers';
import { handleRegistration } from '../controllers/regController';

export const messageHandler = (ws: WebSocket) => (rawData: WebSocket.RawData) => {
  try {
    const message: Message = JSON.parse(rawData.toString());
    console.log(`Received command "${message?.type}"`);

    switch (message?.type) {
      case 'reg': {
        const dataFromClient = parseDataFromClient(message);
        handleRegistration(ws, dataFromClient);
        break;
      }
    }
  } catch {
    console.log('Something went wrong');
  }
};
