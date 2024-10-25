type CommandType =
  | 'reg'
  | 'update_winners'
  | 'create_room'
  | 'add_user_to_room'
  | 'create_game'
  | 'update_room'
  | 'add_ships'
  | 'start_game'
  | 'attack'
  | 'randomAttack'
  | 'turn'
  | 'finish';

export interface Command {
  type: CommandType;
}

export interface Message<T = string> extends Command {
  data: T;
}

export type MessageToClient = Message<object>;

export type SessionId = string;
