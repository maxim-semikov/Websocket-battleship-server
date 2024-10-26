import { gameStore, roomsStore, Ship, userStore } from '../store';
import { placeShipOnMap, sendToClient } from '../helpers';
import { wsClients } from '../ws_server/wsClients';
import { randomUUID } from 'node:crypto';
import {
  AttackStatus,
  ClientShipData,
  Game,
  GameId,
  Player,
  Position,
  UserId,
} from '../store/types';
import { MessageToClient } from '../types';

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
    const ship = new Ship(shipData);
    placeShipOnMap(gameBoard, ship);
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

export const handelStartGame = (gameId: GameId) => {
  const game = gameStore.get(gameId);
  if (!game) {
    console.error('Game not found!');
    return;
  }
  const isAllPlayersAddShips = game.players.every((player) => player.ships?.length);

  if (isAllPlayersAddShips) {
    const currentPlayerIndex = Math.floor(Math.random() * 2);
    const currentPlayer = game.players[currentPlayerIndex]?.userId!;
    gameStore.set(gameId, { ...game, currentPlayer });

    game.players.forEach((player) => {
      const userData = userStore.getUser(player.userId)!;

      const ws = wsClients.get(userData?.sessionId)!;
      sendToClient(ws, {
        type: 'start_game',
        data: {
          gameId: gameId,
          indexPlayer: userData.id,
          ships: player.ships?.map(({ position, direction, length, type }) => ({
            position,
            direction,
            length,
            type,
          })),
        },
      });
      sendToClient(ws, { type: 'turn', data: { currentPlayer } });
    });
  }
};

export const handelAttack = (gameId: GameId, shotPosition: Position, attackerId: UserId) => {
  const game = gameStore.get(gameId);
  if (!game) {
    console.error('Game not found!');
    return;
  }

  if (game.currentPlayer !== attackerId) {
    return;
  }

  let nextCurrentPlayer: UserId = attackerId;
  let attackStatus: AttackStatus = 'miss';
  const opponentData = game.players.find((player) => player.userId !== attackerId)!;
  const attackKey = `${shotPosition.x}:${shotPosition.y}`;
  const ship = opponentData.board?.get(attackKey);

  if (ship) {
    ship.hit();
    attackStatus = 'shot';
    if (ship.isSunk()) {
      attackStatus = 'killed';
    }
  } else {
    nextCurrentPlayer = opponentData.userId;
  }

  gameStore.set(gameId, { ...game, currentPlayer: nextCurrentPlayer });

  sendToAllGamePlayers(game, {
    type: 'attack',
    data: {
      position: shotPosition,
      currentPlayer: attackerId,
      status: attackStatus,
    },
  });
  sendToAllGamePlayers(game, { type: 'turn', data: { currentPlayer: nextCurrentPlayer } });
};

function sendToAllGamePlayers(game: Game, message: MessageToClient) {
  game.players.forEach(({ userId }) => {
    const userData = userStore.getUser(userId)!;
    const ws = wsClients.get(userData?.sessionId)!;

    sendToClient(ws, message);
  });
}
