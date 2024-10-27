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

export function getSurroundingCoordinates(ship: Ship): Position[] {
  const surroundCoords = new Map<string, Position>();

  const { position, length, direction } = ship;

  const shipCoords: Position[] = [];
  for (let i = 0; i < length; i++) {
    const coordinate = direction
      ? { x: position.x, y: position.y + i }
      : { x: position.x + i, y: position.y };
    shipCoords.push(coordinate);
  }

  shipCoords.forEach((position) => {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const newX = position.x + dx;
        const newY = position.y + dy;

        if (
          newX >= 0 &&
          newX < 10 &&
          newY >= 0 &&
          newY < 10 &&
          !shipCoords.some((shipPosition) => shipPosition.x === newX && shipPosition.y === newY)
        ) {
          const key = `${newX}:${newY}`;
          if (!surroundCoords.has(key)) {
            surroundCoords.set(key, { x: newX, y: newY });
          }
        }
      }
    }
  });

  return Array.from(surroundCoords.values());
}
