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

export const handleAddUserToRoom = (ws: WebSocket, roomId: string) => {
  const room = roomsStore.get(roomId);
  if (!room) {
    console.error('Room not found!');
    return;
  }

  const currentUser = getCurrentUser(ws);
  const hasUserInRoom = room.roomUsers?.find((roomUser) => roomUser?.index === currentUser?.id);

  if (hasUserInRoom) {
    console.error('User is already in room!');
    return;
  }

  roomsStore.set(roomId, {
    ...room,
    roomUsers: [...room.roomUsers, { name: currentUser?.name!, index: currentUser?.id! }],
  });
};
