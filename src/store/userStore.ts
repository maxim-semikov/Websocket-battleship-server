import { v4 as uuidV4 } from 'uuid';
import { User, UserNane } from './types';
import WebSocket from 'ws';

export const usersStore = new Map<UserNane, User>();
export const currentUsers = new Map<WebSocket, string | null>();

export const hasUser = (name: string) => usersStore.has(name);
export const getUserId = (name: string) => usersStore.get(name)?.id;

export const addUser = (name: string, password: string): User => {
  const id = uuidV4();
  const user = { id, name, password };
  usersStore.set(name, user);

  return user;
};

export const isAuthenticateUser = (name: string, password: string): boolean => {
  const user = usersStore.get(name);
  return user !== undefined && user.password === password;
};

export const getCurrentUser = (ws: WebSocket) => {
  const currentUserName = currentUsers.get(ws);
  return currentUserName ? usersStore.get(currentUserName) : null;
};
