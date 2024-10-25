import { gameStore, roomsStore, userStore } from '../store';
import { sendToClient } from '../helpers';
import { wsClients } from '../ws_server/wsClients';
import { randomUUID } from 'node:crypto';
import { Player } from '../store/types';

export const handelCreateGame = (roomId: string) => {
  const room = roomsStore.get(roomId);

  if (room?.roomUsers?.length === 2) {
    const users = room.roomUsers?.map((roomUser) => userStore.getUser(roomUser?.index));

    const isAllUsersExists = users?.every((u) => u?.id);
    if (isAllUsersExists) {
      const gameId = randomUUID();
      const players: Player[] = [];

      users.forEach((user) => {
        if (user) {
          const ws = wsClients.get(user.sessionId);
          if (ws) {
            players.push({
              usersId: user.id,
              ships: null,
              board: null,
            });

            sendToClient(ws, {
              type: 'create_game',
              data: {
                idGame: gameId,
                idPlayer: user.id,
              },
            });
          }
        }
      });

      gameStore.set(gameId, { gameId, players, currentPlayer: null });
    }
  }
};
