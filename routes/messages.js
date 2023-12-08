import express from 'express';

import {getRoomMessages, createMessage} from '../controllers/message.js';
import validateToken from '../middlewares/isLoggedIn.js'
const MessageRoutes = express.Router();

MessageRoutes.post('/', validateToken, createMessage);
MessageRoutes.get('/:id', validateToken, getRoomMessages);

export default MessageRoutes;