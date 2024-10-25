import { SessionId } from '../types';

export type UserId = string;
export type UserNane = string;

export interface User {
  id: UserId;
  name: UserNane;
  password: string;
  sessionId: SessionId;
}

export interface RoomUsers {
  name: UserNane;
  index: UserId;
}

export interface Room {
  roomId: number | string;
  roomUsers: RoomUsers[];
}

export type GameId = string | number;

export interface Player {
  usersId: UserId;
  ships: null;
  board: null;
}

export interface Game {
  gameId: GameId;
  players: Player[];
  currentPlayer: UserId | null;
}
