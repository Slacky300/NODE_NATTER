import express from 'express';
import { register, login } from '../controllers/auth.js';

const userRouter = express.Router();


userRouter.route('/register').post(register);
userRouter.route('/login').post(login);

export default userRouter;