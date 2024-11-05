// socket.js
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../constants/config';


const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket"], // Try setting only "websocket" if polling fails
});

export default socket;
