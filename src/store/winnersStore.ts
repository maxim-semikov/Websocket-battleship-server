import { UserId, Winner } from './types';

export const winnersStore = new Map<UserId, Winner>([
  ['test', { name: 'test 1', wins: 1 }],
  ['test1', { name: 'test 2', wins: 5 }],
  ['test2', { name: 'test 3', wins: 3 }],
  ['test3', { name: 'test 4', wins: 2 }],
]);
