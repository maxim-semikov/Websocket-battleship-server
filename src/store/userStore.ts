import { v4 as uuidV4 } from 'uuid';
import { User, UserId } from './types';

export const usersStore = new Map<UserId, User>();

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
