import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { socketCtrl } from './controllers/socket.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import userRouter from './routes/user.js';
import MessageRoutes from './routes/messages.js';
import RoomRoutes from './routes/room.js';
import dbConnect from './utils/dbConnect.js';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // or '*' for any origin
    methods: ['GET', 'POST'],
    transports: ['websocket'], // Allow WebSocket transport
  },
});
socketCtrl(io);

const PORT = process.env.PORT || 8000;

app.use(express.json());

app.use(cors());

server.listen(PORT, () => {
  dbConnect();
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


app.use('/api/v1/users', userRouter);
app.use('/api/v1/messages', MessageRoutes);
app.use('/api/v1/rooms', RoomRoutes);


