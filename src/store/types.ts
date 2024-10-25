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
