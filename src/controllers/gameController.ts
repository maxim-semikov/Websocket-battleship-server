import { roomsStore, userStore } from '../store';
import { sendToClient } from '../helpers';
import { wsClients } from '../ws_server/wsClients';

export const handelCreateGame = (roomId: string) => {
  const room = roomsStore.get(roomId);

  if (room?.roomUsers?.length === 2) {
    room.roomUsers?.forEach((roomUser) => {
      const user = userStore.getUser(roomUser?.index);
      if (user) {
        const ws = wsClients.get(user.sessionId);
        if (ws) {
          sendToClient(ws, {
            type: 'create_game',
            data: {
              idGame: 1,
              idPlayer: user.id,
            },
          });
        }
      }
    });
  }
};
