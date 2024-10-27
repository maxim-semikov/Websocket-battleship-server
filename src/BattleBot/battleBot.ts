import { AttackStatus } from '../store/types';
import { Ship } from '../store';
import { placeShipOnMap } from '../helpers';
import { shipsData } from './shipsOnBoardExamlpe';

export class BattleBot {
  shotsHistory: Map<string, AttackStatus> = new Map();
  board: Map<string, Ship>;
  ships: Ship[] | [];

  constructor() {
    this.shotsHistory = new Map();
    this.board = new Map();

    //todo: it's a temporary solution. In the future it will be necessary to make the ships to be randomised
    this.ships = shipsData.map((shipData) => {
      const ship = new Ship(shipData);
      placeShipOnMap(this.board, ship);
      return ship;
    });
  }

  generateRandomShot() {
    let x, y, key;
    do {
      x = Math.floor(Math.random() * 10);
      y = Math.floor(Math.random() * 10);
      key = `${x}:${y}`;
    } while (this.shotsHistory.has(key));
    return { x, y };
  }

  recordShotResult({ x, y }: { x: string | number; y: string | number }, status: AttackStatus) {
    const key = `${x}:${y}`;
    this.shotsHistory.set(key, status);
    console.log(`Shot (${x}, ${y}): ${status}`);
  }
}
