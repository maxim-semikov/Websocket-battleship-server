import { SessionId } from '../types';
import { User, UserId } from './types';

class UserStore {
  private static instance: UserStore;
  private value: Map<UserId, User>;

  private constructor() {
    this.value = new Map<UserId, User>();
  }

  public static createStore(): UserStore {
    if (!UserStore.instance) {
      UserStore.instance = new UserStore();
    }
    return UserStore.instance;
  }

  public getUserByName(name: string): User | undefined {
    return Array.from(this.value.values()).find((user) => user.name === name);
  }

  public getUserBySessionId(sessionId: SessionId): User | undefined {
    return Array.from(this.value.values()).find((user) => user.sessionId === sessionId);
  }

  public addUser(key: UserId, value: User): void {
    this.value.set(key, value);
  }

  public getUser(key: UserId): User | undefined {
    return this.value.get(key);
  }

  public hasUser(key: UserId): boolean {
    return this.value.has(key);
  }

  public isAuthenticateUser(name: string, password: string): boolean {
    const user = this.getUserByName(name);
    return !!user && user.password === password;
  }

  public updateUserSessionId(name: string, sessionId: SessionId): UserId | undefined {
    const user = this.getUserByName(name);
    if (!user) {
      return;
    }
    this.value.set(user.id, { ...user, sessionId });
    return user?.id;
  }
}

export const userStore = UserStore.createStore();
