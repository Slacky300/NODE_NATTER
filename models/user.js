import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        trim: true,
        maxlength: 32
    },

    username: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32
    },

    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },

    personalInfo: {
        type: String,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    roomsCreated: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room"
    }],

    roomsJoined: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room"
    }],

}, { timestamps: true });

export default mongoose.model("User", userSchema);