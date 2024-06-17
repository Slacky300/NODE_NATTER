import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_APP_SOCKET_URL); // Replace with your server URL

export default socket;
