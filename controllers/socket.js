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
    socket.leave(data.roomId);
    console.log(data.roomMembers);
    console.log("DISCONNECTED FROM ROOM");

   
   if(data.roomMembers){
    const index = data.roomMembers.indexOf(data.user);
    if (index > -1) {
      data.roomMembers.splice(index, 1);
    }
    }
    const responseData = {
      message: `${data.user} left the room`,
      user: data.user,
      isSystemMessage: true,
      members: data.roomMembers,
    };

    io.to(data.roomId).emit('disconnected-from-room', responseData);
  });
};

const logUserConnected = (userId) => {
  console.log(`User ${userId} connected`);
};
