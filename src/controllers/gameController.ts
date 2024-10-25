import { Room } from '../store/types';
import { usersStore } from '../store/userStore';
import { sendToClient } from '../helpers';

export const handelCreateGame = (room: Room | undefined) => {
  if (room?.roomUsers?.length === 2) {
    room.roomUsers?.forEach((user) => {
      const ws = usersStore.get(user?.name)?.client;
      if (ws) {
        sendToClient(ws, {
          type: 'create_game',
          data: {
            idGame: room.roomId,
            idPlayer: user?.name,
          },
        });
      }
    });
  }
};
