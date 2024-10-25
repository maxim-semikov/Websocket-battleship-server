import { gameStore, roomsStore, Ship, userStore } from '../store';
import { placeShipOnMap, sendToClient } from '../helpers';
import { wsClients } from '../ws_server/wsClients';
import { randomUUID } from 'node:crypto';
import { ClientShipData, GameId, Player, UserId } from '../store/types';

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
              userId: user.id,
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

export const handelAddShips = (gameId: GameId, shipsData: ClientShipData[], userId: UserId) => {
  const game = gameStore.get(gameId);
  if (!game) {
    console.error('Game not found!');
    return;
  }

  const gameBoard = new Map();
  const ships = shipsData.map((shipData) => {
    const ship = new Ship(shipData.type, shipData.length);
    const { x, y } = shipData.position;
    placeShipOnMap(gameBoard, ship, x, y, shipData.direction);
    return ship;
  });

  const currentPlayerData: Player = {
    userId: userId,
    ships,
    board: gameBoard,
  };

  gameStore.set(gameId, {
    ...game,
    players: game.players.map((player) => (player?.userId === userId ? currentPlayerData : player)),
  });
};
