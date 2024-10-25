import { Game, GameId, ShipType } from './types';

export const gameStore = new Map<GameId, Game>();

export class Ship {
  hits = 0;
  type: ShipType;
  constructor(type: ShipType, public size: number) {
    this.type = type;
  }

  hit() {
    this.hits++;
  }

  isSunk() {
    return this.hits === this.size;
  }
}
