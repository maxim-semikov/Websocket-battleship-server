import WebSocket from 'ws';
import { Message, SessionId } from '../types';
import { generateRandomShotPositions, parseDataFromClient } from '../helpers';
import { handleRegistration } from '../controllers/regController';
import {
  getUpdatedRoomInfo,
  handleAddUserToRoom,
  handleCreateRoom,
} from '../controllers/roomController';
import {
  handelAddShips,
  handelAttack,
  handelCreateGame,
  handelCreateSingleGame,
  handelStartGame,
} from '../controllers/gameController';
import { wsClients } from './wsClients';
import { gameStore } from '../store';
import { winnersStore } from '../store/winnersStore';
import { Position } from '../store/types';

const broadcastToAllClients = (data: string) => {
  for (const client of wsClients.values()) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
};

const broadcastUpdatedRoomInfo = () => {
  broadcastToAllClients(getUpdatedRoomInfo());
  console.log('Sent "update_room" command');
};

const broadcastUpdateWinners = () => {
  const winners = Array.from(winnersStore.values())?.sort(
    (winner1, winner2) => winner2?.wins - winner1?.wins,
  );
  const data = JSON.stringify({
    type: 'update_winners',
    data: JSON.stringify(winners),
    id: 0,
  });
  broadcastToAllClients(data);
  console.log('Sent "update_winners" command');
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
          broadcastUpdateWinners();
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
          if (!gameId || !ships || !indexPlayer) {
            break;
          }

          handelAddShips(gameId, ships, indexPlayer);
          handelStartGame(gameId);
          break;
        }
        case 'attack':
        case 'randomAttack': {
          const dataFromClient = parseDataFromClient(message);
          const { gameId, x = 0, y = 0, indexPlayer } = dataFromClient;
          if (!gameId || !indexPlayer) {
            break;
          }

          let positions: Position = { x, y };
          if (message?.type === 'randomAttack') {
            positions = generateRandomShotPositions();
          }

          handelAttack(gameId, positions, indexPlayer);

          const gameStateAfterAttack = gameStore.get(gameId);
          if (
            gameStateAfterAttack &&
            gameStateAfterAttack.gameStatus === 'complete' &&
            gameStateAfterAttack.winnerId
          ) {
            broadcastUpdateWinners();
          }
          break;
        }
        case 'single_play': {
          handelCreateSingleGame(currentSessionId);
          break;
        }
      }
    } catch {
      console.log('Something went wrong');
    }
  };
