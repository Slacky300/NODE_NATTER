// Centralized state management with Map for better performance
const activeRooms = new Map(); // Using Map instead of object for better performance with frequent updates
const socketUsers = new Map(); // Maps socket.id to {username, roomId}

import Room from '../models/room.js';

/**
 * Socket controller that handles all socket connections and events
 * @param {Object} io - Socket.io instance
 */
export const socketCtrl = (io) => {
  io.on('connection', (socket) => {
    handleConnection(socket, io);
  });
};

/**
 * Handles a new socket connection and sets up event listeners
 * @param {Object} socket - Socket instance
 * @param {Object} io - Socket.io instance
 */
const handleConnection = (socket, io) => {
  const userId = socket.id;
  console.info(`User connected: ${userId}`);

  // Handle joining a room
  socket.on('joinRoom', async (roomName, username) => {
    try {
      if (!roomName || !username) {
        socket.emit('error', { message: 'Room name and username are required' });
        return;
      }

      // Join the room
      socket.join(roomName);
      
      // Store user data
      socketUsers.set(socket.id, { username, roomId: roomName });
      
      // Update active users for the room
      if (!activeRooms.has(roomName)) {
        activeRooms.set(roomName, new Set([username]));
      } else {
        activeRooms.get(roomName).add(username);
      }
      
      const userCount = activeRooms.get(roomName).size;
      const usersList = Array.from(activeRooms.get(roomName));
      
      // Update room in database
      await updateRoomUserCount(roomName, userCount);

      // Send join notification to room
      emitToRoom(io, roomName, 'joinRoom', {
        message: `${username} joined the room`,
        user: username,
        roomId: roomName,
        isSystemMessage: true,
        roomMembers: usersList,
        roomMembersCount: userCount
      });
      
      console.info(`User ${username} joined room ${roomName}, current count: ${userCount}`);
    } catch (error) {
      handleSocketError(socket, 'Error joining room', error);
    }
  });

  // Handle messages
  socket.on('message-sent', (data) => {
    try {
      const { room, message, user } = data;
      
      if (!room || !message || !user) {
        socket.emit('error', { message: 'Invalid message data' });
        return;
      }
      
      emitToRoom(io, room, 'message-received', {
        message,
        user: { username: user },
        system: false,
        timestamp: Date.now()
      });
    } catch (error) {
      handleSocketError(socket, 'Error sending message', error);
    }
  });

  // Handle user leaving room explicitly
  socket.on('leaveRoom', async (data) => {
    try {
      const { roomId, user } = data;
      
      if (!roomId || !user) {
        socket.emit('error', { message: 'Room ID and username are required' });
        return;
      }
      
      await handleUserLeaving(socket, io, roomId, user);
    } catch (error) {
      handleSocketError(socket, 'Error leaving room', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    try {
      const userData = socketUsers.get(socket.id);
      
      if (userData) {
        const { username, roomId } = userData;
        await handleUserLeaving(socket, io, roomId, username);
        console.info(`User ${username} disconnected from ${roomId}`);
      }
      
      // Clean up user data
      socketUsers.delete(socket.id);
    } catch (error) {
      console.error('Error handling disconnect event', error);
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    try {
      if (!data || !data.room || !data.user) return;
      socket.to(data.room).emit('typing', data.user);
    } catch (error) {
      handleSocketError(socket, 'Error with typing event', error);
    }
  });

  socket.on('stopTyping', (data) => {
    try {
      if (!data || !data.room || !data.user) return;
      socket.to(data.room).emit('stopTyping', data.user);
    } catch (error) {
      handleSocketError(socket, 'Error with stopTyping event', error);
    }
  });
};

/**
 * Handles a user leaving a room, either by explicit leave or disconnection
 * @param {Object} socket - Socket instance
 * @param {Object} io - Socket.io instance
 * @param {string} roomId - Room ID
 * @param {string} username - Username
 * @returns {Promise<void>}
 */
async function handleUserLeaving(socket, io, roomId, username) {
  if (!activeRooms.has(roomId)) return;
  
  // Remove user from room
  socket.leave(roomId);
  
  // Update active users
  const roomUsers = activeRooms.get(roomId);
  roomUsers.delete(username);
  
  const updatedCount = roomUsers.size;
  const updatedUsersList = Array.from(roomUsers);
  
  // Clean up empty rooms
  if (updatedCount === 0) {
    activeRooms.delete(roomId);
  }
  
  // Update room in database
  await updateRoomUserCount(roomId, updatedCount);
  
  // Notify room members
  emitToRoom(io, roomId, 'leaveRoom', {
    message: `${username} left the room`,
    isSystemMessage: true,
    roomMembers: updatedUsersList,
    roomMembersCount: updatedCount
  });
}

/**
 * Updates the active user count for a room in the database
 * @param {string} roomId - Room ID
 * @param {number} count - User count
 * @returns {Promise<void>}
 */
async function updateRoomUserCount(roomId, count) {
  try {
    await Room.findByIdAndUpdate(
      roomId, 
      { activeUsersInRoom: count }, 
      { new: true }
    );
  } catch (error) {
    console.error(`Failed to update room ${roomId} user count`, error);
  }
}

/**
 * Emits an event to a room with data
 * @param {Object} io - Socket.io instance
 * @param {string} room - Room ID
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
function emitToRoom(io, room, event, data) {
  io.to(room).emit(event, data);
}

/**
 * Handles socket errors
 * @param {Object} socket - Socket instance
 * @param {string} message - Error message
 * @param {Error} error - Error object
 */
function handleSocketError(socket, message, error) {
  console.error(message, error);
  socket.emit('error', { message: 'An error occurred. Please try again.' });
}