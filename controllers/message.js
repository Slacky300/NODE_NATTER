import Message from "../models/message.js";
import Room from "../models/room.js";

export const createMessage = async (req, res) => {
    const { content, room } = req.body;

    const newMessage = new Message({
        content,
        user: req.user.id,
        room,
    });

    try {
        await newMessage.save();

        const roomToUpdate = await Room.findById(room);
        roomToUpdate.messages.push(newMessage._id);
        roomToUpdate.lastMessage = newMessage._id;
        await roomToUpdate.save();

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};

export const getRoomMessages = async (req, res) => {

    const { id } = req.params;

    try {
        const room = await Room.findById(id).populate("messages");
        for(const message of room.messages){
            await message.populate("user")
        }
        res.status(200).json({messages: room.messages});
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};



