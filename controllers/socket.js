const activeUsers = {};

export const socketCtrl = (io) => {
  io.on('connection', (socket) => {
    const userId = socket.id;

    handleConnection(socket, io, userId);
  });
};

const handleConnection = (socket, io, userId) => {
  activeUsers[userId] = { username: '', room: '' };

  logUserConnected(userId);

  socket.on('joinRoom', (roomName, username) => {
    socket.join(roomName);
    activeUsers[userId] = { username, room: roomName };

    socket.room = roomName;


    const responseData = {
      message: `${username} joined the room`,
      user: username,
      isSystemMessage: true,
      roomMembers: activeUsers,
    };

    io.to(socket.room).emit('joinRoom', responseData);
  });

  socket.on('disconnect', () => {
    const disconnectedUser = activeUsers[userId];
    console.log(disconnectedUser)

    if(!disconnectedUser) return;

    const responseData = {
      message: disconnectedUser ? `${disconnectedUser.username} left the room` : '',
      user: disconnectedUser? disconnectedUser.username : '',
      isSystemMessage: true,
      roomMembers: activeUsers,
    };
    if(activeUsers[userId]){
      delete activeUsers[userId];

    }

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

  socket.on('leaveRoom', (data) => {
    socket.leave(data.roomId);
    socket.room = data.roomId;

    const responseData = {
      message: `${data.user} left the room`,
      user: data.user,
      isSystemMessage: true,
      roomMembers: activeUsers,
    };

    delete activeUsers[userId];


    io.to(socket.room).emit('disconnected-from-room', responseData);
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
