import WebSocket from 'ws';
import { v4 as uuidV4 } from 'uuid';
import { roomsStore } from '../store/roomStore';
import { getCurrentUser } from '../store/userStore';

export const getUpdatedRoomInfo = () => {
  const roomsData = Array.from(roomsStore.values());
  return JSON.stringify({
    type: 'update_room',
    data: JSON.stringify(roomsData),
    id: 0,
  });
};

export const handleCreateRoom = (ws: WebSocket) => {
  const currentUser = getCurrentUser(ws);
  const roomId = uuidV4();
  roomsStore.set(roomId, {
    roomId,
    roomUsers: [{ name: currentUser?.name!, index: currentUser?.id! }],
  });
};
