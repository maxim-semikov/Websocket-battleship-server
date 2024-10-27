import { randomUUID } from 'node:crypto';
import { roomsStore, userStore } from '../store';
import { SessionId } from '../types';

export const getUpdatedRoomInfo = () => {
  const roomsData = Array.from(roomsStore.values())?.filter((room) => room?.roomUsers?.length <= 1);
  return JSON.stringify({
    type: 'update_room',
    data: JSON.stringify(roomsData),
    id: 0,
  });
};

export const handleCreateRoom = (sessionId: SessionId) => {
  const currentUser = userStore.getUserBySessionId(sessionId);
  if (!currentUser) {
    console.error('Something went wrong! User is not exist');
    return;
  }

  const roomId = randomUUID();
  roomsStore.set(roomId, {
    roomId,
    roomUsers: [{ name: currentUser?.name, index: currentUser?.id }],
  });
  console.log(`Room ${roomId} was created`);
};

export const handleAddUserToRoom = (sessionId: SessionId, roomId: string) => {
  const room = roomsStore.get(roomId);
  if (!room) {
    console.error('Room not found!');
    return;
  }

  const currentUser = userStore.getUserBySessionId(sessionId);
  const hasUserInRoom = room.roomUsers?.find((roomUser) => roomUser?.index === currentUser?.id);

  if (hasUserInRoom) {
    console.error('User is already in room!');
    return;
  }

  const roomUsers = [...room.roomUsers, { name: currentUser?.name!, index: currentUser?.id! }];
  const newRoomData = { ...room, roomUsers };
  roomsStore.set(roomId, newRoomData);
  console.log(`User ${currentUser?.name} was added to room ${roomId}`);
};
