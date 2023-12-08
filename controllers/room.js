import Room from '../models/room.js';
import User from '../models/user.js';
import bcrypt from 'bcrypt';

export const createRoom = async (req, res) => {

    const {roomName, roomPassword, maxUsers } = req.body;
    if(maxUsers < 2){
        return res.status(409).json({ message: 'Max users must be at least 2' });
    }
    if(maxUsers > 10){
        return res.status(409).json({ message: 'Max users must be at most 10' });
    }
    const existingRoom = await Room.findOne({ roomName });
    if (existingRoom) {
        return res.status(409).json({ message: 'Room Name already exists' });
    }
    const existingUser = await User.findById(req.user.id);
    if (existingUser.roomsCreated.length >= 1) {
        return res.status(409).json({ message: 'You can only create 1 room' });
    }
    const hashedPassword = await bcrypt.hash(roomPassword, 12);

    const newRoom = new Room({
        roomName,
        roomPassword: hashedPassword,
        roomCreator: req.user.id,
        maxUsers
    });

    try {
        await newRoom.save();

        const roomCreator = await User.findById(req.user.id);
        roomCreator.roomsCreated.push(newRoom._id);
        await roomCreator.save();

        res.status(201).json({newRoom: newRoom, message: `You have created ${newRoom.roomName}`});
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

export const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find({}).populate('roomCreator');
        res.status(200).json({rooms: rooms});
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getRoom = async (req, res) => {
    const { id } = req.params;

    try {
        const room = await Room.findById(id);
        res.status(200).json(room);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const joinRoom = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const {roomPassword} = req.body;

    try {
        const room = await Room.findById(id);
        if (!bcrypt.compare(roomPassword, room.roomPassword)) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        if(room.users.includes(req.user.id)){
            return res.status(200).json({room: room, message: `You have joined ${room.roomName}`});;
        }
        room.users.push(req.user.id);
        await room.save();

        const user = await User.findById(req.user.id);
        user.roomsJoined.push(room._id);
        await user.save();

        res.status(200).json({room: room, message: `You have joined ${room.roomName}`});
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getRoomsThatUserIsIn = async (req, res) => {
    try {
        const rooms = await Room.find({ users: { $in: [req.user.id] } });
        res.status(200).json(rooms);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const leaveRoom = async (req, res) => {

    const { roomId } = req.params;

    try {
        const room = await Room.findById(roomId);
        await room.users.pull(req.user.id);
        await room.save();

        const user = await User.findById(req.user.id);
        user.roomsJoined.pull(room._id);
        await user.save();

        res.status(200).json({room: room, message: `You have left ${room.roomName}`});
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}