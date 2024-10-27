import { ClientShipData } from '../store/types';

export const shipsData: ClientShipData[] = [
  {
    position: {
      x: 3,
      y: 7,
    },
    direction: false,
    type: 'huge',
    length: 4,
  },
  {
    position: {
      x: 1,
      y: 4,
    },
    direction: false,
    type: 'large',
    length: 3,
  },
  {
    position: {
      x: 6,
      y: 2,
    },
    direction: false,
    type: 'large',
    length: 3,
  },
  {
    position: {
      x: 1,
      y: 2,
    },
    direction: false,
    type: 'medium',
    length: 2,
  },
  {
    position: {
      x: 5,
      y: 4,
    },
    direction: false,
    type: 'medium',
    length: 2,
  },
  {
    position: {
      x: 8,
      y: 7,
    },
    direction: true,
    type: 'medium',
    length: 2,
  },
  {
    position: {
      x: 2,
      y: 0,
    },
    direction: true,
    type: 'small',
    length: 1,
  },
  {
    position: {
      x: 8,
      y: 5,
    },
    direction: false,
    type: 'small',
    length: 1,
  },
  {
    position: {
      x: 0,
      y: 6,
    },
    direction: false,
    type: 'small',
    length: 1,
  },
  {
    position: {
      x: 3,
      y: 9,
    },
    direction: true,
    type: 'small',
    length: 1,
  },
] as const;
