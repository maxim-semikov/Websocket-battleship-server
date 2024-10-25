import { ClientShipData, Game, GameId, Position, ShipType } from './types';

export const gameStore = new Map<GameId, Game>();

export class Ship {
  hits = 0;
  type: ShipType;
  position: Position;
  direction: boolean;
  length: number;

  constructor(ship: ClientShipData) {
    this.type = ship.type;
    this.position = ship.position;
    this.direction = ship.direction;
    this.length = ship.length;
  }

  hit() {
    this.hits++;
  }

  isSunk() {
    return this.hits === this.length;
  }
}
