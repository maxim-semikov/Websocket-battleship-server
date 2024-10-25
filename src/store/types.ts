import { SessionId } from '../types';
import { Ship } from './gameStore';

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

export type ShipType = 'small' | 'medium' | 'large' | 'huge';

export interface Position {
  x: number;
  y: number;
}

export interface ClientShipData {
  position: Position;
  direction: boolean;
  type: ShipType;
  length: number;
}

export type GameId = string | number;

export interface Player {
  userId: UserId;
  ships: Ship[] | null;
  board: Map<string, Ship> | null;
}

export interface Game {
  gameId: GameId;
  players: Player[];
  currentPlayer: UserId | null;
}
