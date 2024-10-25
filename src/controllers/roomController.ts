import WebSocket from 'ws';
import { randomUUID } from 'node:crypto';
import { roomsStore } from '../store/roomStore';
import { getCurrentUser } from '../store/userStore';

export const getUpdatedRoomInfo = () => {
  const roomsData = Array.from(roomsStore.values())?.filter((room) => room?.roomUsers?.length <= 1);
  return JSON.stringify({
    type: 'update_room',
    data: JSON.stringify(roomsData),
    id: 0,
  });
};

export const handleCreateRoom = (ws: WebSocket) => {
  const currentUser = getCurrentUser(ws);
  const roomId = randomUUID();
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
  const roomUsers = [...room.roomUsers, { name: currentUser?.name!, index: currentUser?.id! }];
  const newRoomData = { ...room, roomUsers };
  roomsStore.set(roomId, newRoomData);

  return newRoomData;
};
