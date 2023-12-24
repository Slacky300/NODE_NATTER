const activeUsers = {};
const socketIdAndUsername = {};

import Room from '../models/room.js';


export const socketCtrl = (io) => {
  io.on('connection', (socket) => {
    const userId = socket.id;

    handleConnection(socket, io, userId);
  });
};

const handleConnection = (socket, io, userId) => {

  logUserConnected(userId);


  socket.on('joinRoom', async (roomName, username) => {
    socket.join(roomName);

    socketIdAndUsername[socket.id] = username;

    socket.room = roomName;



    if(!activeUsers[roomName]) {
      activeUsers[roomName] = {
        users: [username],
        count: 1,
      }
    }else{
      activeUsers[roomName] = {
        users: [...activeUsers[roomName].users, username],
        count: activeUsers[roomName].count + 1,
      }
    }

    await Room.findByIdAndUpdate(roomName, {
      activeUsersInRoom: activeUsers[roomName].count,
    });


    const responseData = {
      message: `${username} joined the room`,
      user: username,
      roomId: socket.room,
      isSystemMessage: true,
      roomMembers: activeUsers[roomName].users,
      roomMembersCount: activeUsers[roomName].count,
      roomWithUsers: activeUsers,
    };


    io.to(socket.room).emit('joinRoom', responseData);
  });

  socket.on('disconnect', async () => {


    const username = socketIdAndUsername[socket.id];
    let updatedUsers = [];

    if(activeUsers[socket.room]) {
      updatedUsers = activeUsers[socket.room].users.filter(user => user !== username);
      activeUsers[socket.room] = {
        users: updatedUsers,
        count: updatedUsers.length,
      }
    }

    await Room.findByIdAndUpdate(socket.room, {
      activeUsersInRoom: activeUsers[socket.room]?.count,
    });
    const responseData = {
      message: `${username} disconnected`,
      isSystemMessage: true,
      roomMembers: updatedUsers,
      roomMembersCount: updatedUsers.length,
      roomWithUsers: activeUsers,
    };


    io.to(socket.room).emit('disconnected-from-room', responseData);

  });


  socket.on('message-sent', (data) => {
    socket.room = data.room;
    const responseData = {
      message: data.message,
      user: {
        username: data.user,
      },
      system: false,
    };
    io.to(socket.room).emit('message-received', responseData);
  });

  socket.on('leaveRoom', async (data) => {
    const { roomId, user } = data;
  
    socket.leave(roomId);
    
    let updatedUsers = [];
  
    if (activeUsers[roomId]) {
      updatedUsers = activeUsers[roomId].users.filter(existingUser => existingUser !== user);

      activeUsers[roomId] = {
        users: updatedUsers,
        count: updatedUsers.length,
      }
    }

    await Room.findByIdAndUpdate(roomId, {
      activeUsersInRoom: activeUsers[roomId].count,
    });
  
    const responseData = {
      message: `${user} left the room`,
      isSystemMessage: true,
      roomMembers: updatedUsers,
      roomMembersCount: updatedUsers.length,
      roomWithUsers: activeUsers,
    };
  
  
    io.to(roomId).emit('leaveRoom', responseData);
  });
  


  socket.on('typing', (data) => {
    io.to(data.room).emit('typing', data.user);
  });

  socket.on('stopTyping', (data) => {
    io.to(data.room).emit('stopTyping', data.user);
  });

};

const logUserConnected = (userId) => {
  console.log(`User ${userId} connected`);
};

