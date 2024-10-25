import WebSocket from 'ws';
import { addUser, getUserId, hasUser, isAuthenticateUser } from '../store/userStore';
import { sendToClient } from '../helpers';

export const handleRegistration = (ws: WebSocket, data: { name: string; password: string }) => {
  const { name, password } = data;
  if (!hasUser(name)) {
    const user = addUser(name, password);
    sendToClient(ws, {
      type: 'reg',
      data: {
        name,
        index: user.id,
        error: false,
        errorText: '',
      },
    });
  } else if (isAuthenticateUser(name, password)) {
    sendToClient(ws, {
      type: 'reg',
      data: {
        name,
        index: getUserId(name),
        error: false,
        errorText: '',
      },
    });
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
  }
};
