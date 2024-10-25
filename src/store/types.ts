import WebSocket from 'ws';

export type UserId = string;
export type UserNane = string;

export interface User {
  id: UserId;
  name: UserNane;
  password: string;
  client: WebSocket;
}

export interface RoomUsers {
  name: UserNane;
  index: UserId;
}

export interface Room {
  roomId: number | string;
  roomUsers: RoomUsers[];
}
