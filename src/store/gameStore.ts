import { ClientShipData, Game, GameId, Position, ShipType } from './types';

export const gameStore = new Map<GameId, Game>();

export class Ship {
  hitPositions = new Set();
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

  hit(x: number | string, y: number | string) {
    const key = `${x}:${y}`;
    if (this.hitPositions.has(key)) {
      return false;
    }

    this.hitPositions.add(key);
    this.hits++;
    return true;
  }

  isSunk() {
    return this.hits === this.length;
  }
}
