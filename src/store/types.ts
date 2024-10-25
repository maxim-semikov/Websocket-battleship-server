export type UserId = string;
export type UserNane = string;

export interface User {
  id: UserId;
  name: UserNane;
  password: string;
}

export interface Room {
  roomId: number | string;
  roomUsers: {
    name: UserNane;
    index: UserId;
  }[];
}
