const activeUsers = {};
const activeRooms = {};

export const socketCtrl = (io) => {
  io.on('connection', (socket) => {
    const userId = socket.id;

    handleConnection(socket, io, userId);
  });
};

const handleConnection = (socket, io, userId) => {
  activeUsers[userId] = { username: '', rooms: [] };

  logUserConnected(userId);

  socket.on('joinRoom', (roomName, username) => {
    socket.join(roomName);

    // Initialize room-specific object if it doesn't exist
    if (!activeRooms[roomName]) {
      activeRooms[roomName] = { members: {} };
    }

    // Update user and room information
    activeUsers[userId] = { username, rooms: [...activeUsers[userId].rooms, roomName] };
    activeRooms[roomName].members[userId] = { username, room: roomName };
    socket.room = roomName;

    const responseData = {
      message: `${username} joined the room`,
      user: username,
      roomId: socket.room,
      isSystemMessage: true,
      roomMembers: activeRooms[roomName].members,
      roomMembersCount: Object.keys(activeRooms[roomName].members).length,
    };

    io.to(socket.room).emit('joinRoom', responseData);
  });

  socket.on('disconnect', () => {
    const disconnectedUser = activeUsers[userId];

    if (!disconnectedUser) return;

    // Handle user disconnection from each room
    disconnectedUser.rooms.forEach((room) => {
      const responseData = {
        message: `${disconnectedUser.username} left the room`,
        user: disconnectedUser.username,
        isSystemMessage: true,
        roomId: socket.room,
        roomMembers: activeRooms[room].members,
        roomMembersCount: Object.keys(activeRooms[room].members).length,
      };

      if (activeRooms[room].members[userId]) {
        delete activeRooms[room].members[userId];
      }

      io.to(room).emit('disconnected-from-room', responseData);
    });

    // Remove the user from the global activeUsers object
    delete activeUsers[userId];
  });

  // ... (other event handlers)

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

  socket.on('leaveRoom', (data) => {
    const { roomId, user } = data;

    // Check if the user is a member of the room
    if (activeRooms[roomId] && activeRooms[roomId].members[userId]) {
        socket.leave(roomId);
        socket.room = roomId;

        const responseData = {
            message: `${user} left the room`,
            user: user,
            isSystemMessage: true,
            roomMembers: activeRooms[roomId].members,
            roomMembersCount: Object.keys(activeRooms[roomId].members).length,
        };

        // Remove the user from the room-specific members
        delete activeRooms[roomId].members[user];

        io.to(socket.room).emit('disconnected-from-room', responseData);
    }
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

