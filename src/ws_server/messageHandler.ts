import WebSocket from 'ws';
import { Message, SessionId } from '../types';
import { parseDataFromClient } from '../helpers';
import { handleRegistration } from '../controllers/regController';
import {
  getUpdatedRoomInfo,
  handleAddUserToRoom,
  handleCreateRoom,
} from '../controllers/roomController';
import { handelAddShips, handelCreateGame } from '../controllers/gameController';
import { wsClients } from './wsClients';

const broadcastToAllClients = (data: string) => {
  for (const client of wsClients.values()) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
};

const broadcastUpdatedRoomInfo = () => {
  broadcastToAllClients(getUpdatedRoomInfo());
};

export const messageHandler =
  (ws: WebSocket, currentSessionId: SessionId) => (rawData: WebSocket.RawData) => {
    try {
      const message: Message = JSON.parse(rawData.toString());
      console.log(`Received command "${message?.type}"`);

      switch (message?.type) {
        case 'reg': {
          const dataFromClient = parseDataFromClient(message);
          handleRegistration(ws, currentSessionId, dataFromClient);
          broadcastUpdatedRoomInfo();
          break;
        }
        case 'create_room': {
          handleCreateRoom(currentSessionId);
          broadcastUpdatedRoomInfo();
          break;
        }
        case 'add_user_to_room': {
          const dataFromClient = parseDataFromClient(message);
          handleAddUserToRoom(currentSessionId, dataFromClient?.indexRoom);
          handelCreateGame(dataFromClient?.indexRoom);
          broadcastUpdatedRoomInfo();
          break;
        }
        case 'add_ships': {
          const dataFromClient = parseDataFromClient(message);
          const { gameId, ships, indexPlayer } = dataFromClient;
          if (gameId && ships && indexPlayer) {
            handelAddShips(gameId, ships, indexPlayer);
          }
          break;
        }
      }
    } catch {
      console.log('Something went wrong');
    }
  };
