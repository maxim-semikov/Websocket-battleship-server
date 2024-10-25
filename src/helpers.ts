import { Message, MessageToClient } from './types';
import WebSocket from 'ws';
import { Ship } from './store';

export const parseDataFromClient = (message: Message) => JSON.parse(message.data);

export const sendToClient = (ws: WebSocket, message: MessageToClient) => {
  const data = { ...message, data: JSON.stringify(message?.data), id: 0 };
  ws.send(JSON.stringify(data));
};

export function placeShipOnMap(gameBoardMap: Map<string, Ship>, ship: Ship) {
  const { x, y } = ship.position;
  for (let i = 0; i < ship.length; i++) {
    const key = ship.direction ? `${x + i}:${y}` : `${x}:${y + i}`;
    gameBoardMap.set(key, ship);
  }
}
