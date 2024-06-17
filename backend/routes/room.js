import express from 'express';

import { createRoom, getRoom, getRooms, joinRoom, getRoomsThatUserIsIn, leaveRoom, deleteRoom, editRoomPassword } from '../controllers/room.js';
import validateToken from '../middlewares/isLoggedIn.js'

const RoomRoutes = express.Router();

RoomRoutes.post('/create', validateToken, createRoom);
RoomRoutes.get('/', validateToken, getRooms);
RoomRoutes.get('/:id', validateToken, getRoom).delete('/:id', validateToken, deleteRoom);
RoomRoutes.patch('/join/:id', validateToken, joinRoom);
RoomRoutes.get('/user/rooms', validateToken, getRoomsThatUserIsIn);
RoomRoutes.patch('/leave/:roomId', validateToken, leaveRoom);
RoomRoutes.patch('/edit/:id', validateToken, editRoomPassword);

export default RoomRoutes;


