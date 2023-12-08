export const socketCtrl = (io) => {
  const roomMembers = {}; // Initialize room members outside of handleConnection

  io.on('connection', (socket) => {
    const userId = socket.id;

    handleConnection(socket, io, userId, roomMembers);
  });
};

const handleConnection = (socket, io, userId, roomMembers) => {
  logUserConnected(userId);

  socket.on('joinRoom', (roomName, userId) => {
    socket.join(roomName);

    if (!roomMembers[roomName]) {
      roomMembers[roomName] = [];
    }
    if (!roomMembers[roomName].includes(userId)) {
      roomMembers[roomName].push(userId);
    }

    const responseData = {
      message: `${userId} joined the room`,
      user: userId,
      isSystemMessage: true,
      members: roomMembers[roomName],
    };

    io.to(roomName).emit('joinRoom', responseData);
  });

  socket.on('message-sent', (data) => {
    const responseData = {
      message: data.message,
      user: {
        username: data.user,
      },
      system: false,
    };
    io.to(data.room).emit('message-received', responseData);
  });

  socket.on('leaveRoom', (data) => {
    socket.leave(data.room);
    console.log(data);
    console.log("DISCONNECTED FROM ROOM");

    const index = roomMembers[data.room]?.indexOf(userId);
    if (index !== -1) {
      roomMembers[data.room].splice(index, 1);
    }

    const responseData = {
      message: `${data.user} left the room`,
      user: data.user,
      isSystemMessage: true,
      members: roomMembers[data.room],
    };

    io.to(data.room).emit('disconnected-from-room', responseData);
  });
};

const logUserConnected = (userId) => {
  console.log(`User ${userId} connected`);
};
