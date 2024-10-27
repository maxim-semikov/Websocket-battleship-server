import { randomUUID } from 'node:crypto';
import WebSocket from 'ws';
import { sendToClient } from '../helpers';
import { userStore } from '../store';
import { User } from '../store/types';
import { SessionId } from '../types';

export const handleRegistration = (
  ws: WebSocket,
  sessionId: SessionId,
  data: { name: string; password: string },
) => {
  const { name, password } = data;
  if (!userStore.getUserByName(name)) {
    const id = randomUUID();
    const user: User = { id, name, password, sessionId };
    userStore.addUser(id, user);

    sendToClient(ws, {
      type: 'reg',
      data: {
        name,
        index: user.id,
        error: false,
        errorText: '',
      },
    });
    console.log(`User ${name} was added to DB.`);
  } else if (userStore.isAuthenticateUser(name, password)) {
    const userId = userStore.updateUserSessionId(name, sessionId);
    sendToClient(ws, {
      type: 'reg',
      data: {
        name,
        index: userId,
        error: false,
        errorText: '',
      },
    });
    console.log(`User ${name} logged in.`);
  } else {
    sendToClient(ws, {
      type: 'reg',
      data: {
        name,
        index: 0,
        error: true,
        errorText: 'Wrong password.',
      },
    });
    console.error('Authorisation failed! Wrong password.');
  }
};
