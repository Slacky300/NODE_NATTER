import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
    roomCreator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    roomName: {
        type: String,
        default: ""
    },
    roomPassword: {
        type: String,
    },

    maxUsers: {
        type: Number,
        default: 10
    },

    activeUsersInRoom: {
        type: Number,
        default: 0
    },
}, { timestamps: true });

export default mongoose.model("Room", roomSchema);
