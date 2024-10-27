import { Message, MessageToClient } from './types';
import WebSocket from 'ws';
import { Ship } from './store';
import { Position } from './store/types';

export const parseDataFromClient = (message: Message) => JSON.parse(message.data);

export const sendToClient = (ws: WebSocket, message: MessageToClient) => {
  const data = { ...message, data: JSON.stringify(message?.data), id: 0 };
  ws.send(JSON.stringify(data));
};

export function placeShipOnMap(gameBoardMap: Map<string, Ship>, ship: Ship) {
  const { x, y } = ship.position;
  for (let i = 0; i < ship.length; i++) {
    const key = ship.direction ? `${x}:${y + i}` : `${x + i}:${y}`;
    gameBoardMap.set(key, ship);
  }
}

export function generateRandomShotPositions(): Position {
  const x = Math.floor(Math.random() * 10);
  const y = Math.floor(Math.random() * 10);
  return { x, y };
}
