import { gameStore, roomsStore, Ship, userStore } from '../store';
import { getSurroundingCoordinates, placeShipOnMap, sendToClient } from '../helpers';
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
import { MessageToClient, SessionId } from '../types';
import { winnersStore } from '../store/winnersStore';
import { BattleBot } from '../BattleBot/battleBot';

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

      gameStore.set(gameId, {
        gameId,
        bot: null,
        players,
        currentPlayer: null,
        gameStatus: 'created',
      });
      console.log(`The game was created: ${gameId}`);
    }
  }
};

export const handelCreateSingleGame = (sessionId: SessionId) => {
  const gameId = randomUUID();
  const currentUser = userStore.getUserBySessionId(sessionId)!;
  const ws = wsClients.get(sessionId)!;

  sendToClient(ws, {
    type: 'create_game',
    data: {
      idGame: gameId,
      idPlayer: currentUser.id,
    },
  });

  const bot = new BattleBot();
  gameStore.set(gameId, {
    gameId,
    bot,
    players: [
      {
        userId: currentUser.id,
        ships: null,
        board: null,
      },
    ],
    currentPlayer: null,
    gameStatus: 'created',
  });

  console.log(`The single game was created: ${gameId}`);
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
  console.log(`User's ships was added to the game store. Game id: ${gameId}`);
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
    const currentPlayer = game.players[currentPlayerIndex]?.userId || game.players[0]?.userId!;
    gameStore.set(gameId, { ...game, currentPlayer, gameStatus: 'inProgress' });

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
      console.log(`The game ${gameId} was started. Current player: ${currentPlayer}`);
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

  if (game.bot) {
    handelSingleGameAttack(game, shotPosition, attackerId);
  } else {
    handelMultiplayerModeAttack(game, shotPosition, attackerId);
  }
};

export const handelMultiplayerModeAttack = (
  game: Game,
  shotPosition: Position,
  attackerId: UserId,
) => {
  let nextCurrentPlayer: UserId = attackerId;
  let attackStatus: AttackStatus = 'miss';
  const opponentData = game.players.find((player) => player.userId !== attackerId)!;
  const { gameId } = game;
  const { x, y } = shotPosition;
  const attackKey = `${x}:${y}`;
  const ship = opponentData.board?.get(attackKey);

  if (ship) {
    const isHit = ship.hit(x, y);
    if (!isHit) {
      return;
    }

    attackStatus = 'shot';
    if (ship.isSunk()) {
      attackStatus = 'killed';

      const shipSurroundingCoordinates = getSurroundingCoordinates(ship);
      shipSurroundingCoordinates.forEach((coordinate) => {
        sendToAllGamePlayers(game, {
          type: 'attack',
          data: {
            position: coordinate,
            currentPlayer: attackerId,
            status: 'miss',
          },
        });
      });
    }
  } else {
    nextCurrentPlayer = opponentData.userId;
  }

  console.log(`Game ${gameId}: The command result is ${attackStatus}`);
  sendToAllGamePlayers(game, {
    type: 'attack',
    data: {
      position: shotPosition,
      currentPlayer: attackerId,
      status: attackStatus,
    },
  });

  const isGameFinished = opponentData?.ships?.every((ship) => ship.isSunk());

  if (isGameFinished) {
    sendToAllGamePlayers(game, {
      type: 'finish',
      data: {
        winPlayer: attackerId,
      },
    });
    gameStore.set(gameId, { ...game, gameStatus: 'complete', winnerId: attackerId });

    console.log(`Game ${gameId} finished. Winner: ${attackerId} `);

    if (winnersStore.has(attackerId)) {
      const winnerData = winnersStore.get(attackerId)!;
      const wins = winnerData?.wins + 1;
      winnersStore.set(attackerId, { ...winnerData, wins });
    } else {
      const winner = userStore.getUser(attackerId)!;
      winnersStore.set(attackerId, { name: winner?.name, wins: 1 });
    }
  } else {
    gameStore.set(gameId, { ...game, currentPlayer: nextCurrentPlayer });
    sendToAllGamePlayers(game, { type: 'turn', data: { currentPlayer: nextCurrentPlayer } });
  }
};

export const handelSingleGameAttack = (game: Game, shotPosition: Position, attackerId: UserId) => {
  const battleBot = game?.bot;
  if (!battleBot) {
    console.error('The bot has not been created! Game id: ', game.gameId);
    return;
  }

  const { gameId } = game;
  const { x, y } = shotPosition;
  const attackKey = `${x}:${y}`;
  const ship = battleBot.board?.get(attackKey);

  if (ship && ship.hit(x, y)) {
    let attackStatus: AttackStatus = 'shot';
    if (ship.isSunk()) {
      attackStatus = 'killed';

      const shipSurroundingCoordinates = getSurroundingCoordinates(ship);
      shipSurroundingCoordinates.forEach((coordinate) => {
        sendToAllGamePlayers(game, {
          type: 'attack',
          data: {
            position: coordinate,
            currentPlayer: attackerId,
            status: 'miss',
          },
        });
      });
    }

    sendToAllGamePlayers(game, {
      type: 'attack',
      data: {
        position: shotPosition,
        currentPlayer: attackerId,
        status: attackStatus,
      },
    });
    const isPlayerWin = game.bot?.ships?.every((ship) => ship.isSunk());
    if (isPlayerWin) {
      sendToAllGamePlayers(game, {
        type: 'finish',
        data: {
          winPlayer: attackerId,
        },
      });
      gameStore.set(gameId, { ...game, gameStatus: 'complete', winnerId: attackerId });

      console.log(`Game ${gameId} finished. Winner: ${attackerId} `);
    }
  } else {
    const botId = 'BattleBotId';

    sendToAllGamePlayers(game, {
      type: 'attack',
      data: {
        position: shotPosition,
        currentPlayer: attackerId,
        status: !ship ? 'miss' : !ship.hit(x, y) && ship.isSunk() ? 'killed' : 'shot',
      },
    });
    sendToAllGamePlayers(game, { type: 'turn', data: { currentPlayer: botId } });

    const playerData = game.players[0]!;
    let battleBotTurn = true;
    let battleBotShotPosition: Position;

    while (battleBotTurn) {
      battleBotShotPosition = battleBot.generateRandomShot();
      const shotKey = `${battleBotShotPosition.x}:${battleBotShotPosition.y}`;
      const ship = playerData.board?.get(shotKey);

      if (ship && ship.hit(battleBotShotPosition.x, battleBotShotPosition.y)) {
        let attackStatus: AttackStatus = 'shot';
        if (ship.isSunk()) {
          attackStatus = 'killed';

          const shipSurroundingCoordinates = getSurroundingCoordinates(ship);
          shipSurroundingCoordinates.forEach((coordinate) => {
            sendToAllGamePlayers(game, {
              type: 'attack',
              data: {
                position: coordinate,
                currentPlayer: botId,
                status: 'miss',
              },
            });
            battleBot.recordShotResult(coordinate, 'miss');
          });
        }
        sendToAllGamePlayers(game, {
          type: 'attack',
          data: {
            position: battleBotShotPosition,
            currentPlayer: botId,
            status: attackStatus,
          },
        });
        battleBot.recordShotResult(battleBotShotPosition, attackStatus);

        const isBotWin = playerData.ships?.every((ship) => ship.isSunk());
        if (isBotWin) {
          sendToAllGamePlayers(game, {
            type: 'finish',
            data: {
              winPlayer: botId,
            },
          });
          gameStore.set(gameId, { ...game, gameStatus: 'complete', winnerId: 'BattleBot' });

          console.log(`Game ${gameId} finished. Winner: BattleBot`);
        }
      } else {
        sendToAllGamePlayers(game, {
          type: 'attack',
          data: {
            position: battleBotShotPosition,
            currentPlayer: botId,
            status: 'miss',
          },
        });
        battleBot.recordShotResult(battleBotShotPosition, 'miss');
        sendToAllGamePlayers(game, { type: 'turn', data: { currentPlayer: attackerId } });
        battleBotTurn = false;
      }
    }
  }
};

function sendToAllGamePlayers(game: Game, message: MessageToClient) {
  game.players.forEach(({ userId }) => {
    const userData = userStore.getUser(userId)!;
    const ws = wsClients.get(userData?.sessionId)!;

    sendToClient(ws, message);
  });
}
