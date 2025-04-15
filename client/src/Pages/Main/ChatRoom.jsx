import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/authContext';
import { useNavigate, useParams } from 'react-router-dom';
import ChatBubble from '../../components/ChatBubble';
import { fetchMessages, sendMessage } from '../../helpers/chats/chatFn';
import ReactRouterPrompt from 'react-router-prompt';
import { getLocalStorageWithExpiry } from '../../helpers/auth/authFn';
import CopyButton from '../../components/CopyButton';
import { useUpdate } from '../../context/hasUpdated';
import { extractBaseUrl } from '../../helpers/room/roomFn';
import EmojiPicker from 'emoji-picker-react';
import { toast } from 'react-toastify';
import { useSocket } from '../../context/socketContext';

/**
 * ChatRoom component for handling real-time chat functionality
 * Manages room connections, message history, and user interactions
 */
const ChatRoom = () => {
  // Context and router hooks
  const { socket } = useSocket();
  const { auth } = useAuth();
  const navigate = useNavigate();
  const { roomId, roomName } = useParams();
  const { roomEventHappened, setRoomEventHappened } = useUpdate();

  // UI state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState("");
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Room state
  const [roomMembers, setRoomMembers] = useState([]);
  const [noOfMembers, setNoOfMembers] = useState(0);
  const [socketMessages, setSocketMessages] = useState([{
    message: "Welcome to the chat room",
    user: { username: "System" },
    isSystemMessage: true,
  }]);
  const [connectionError, setConnectionError] = useState(null);

  // Refs
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Constants
  const MAX_MESSAGE_LENGTH = 1000;
  const TYPING_TIMEOUT = 2000; // 2 seconds
  const RECONNECT_TIMEOUT = 5000; // 5 seconds

  /**
   * Handles text input changes and manages typing status
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    const newMessage = e.target.value;
    // Prevent exceeding max length
    if (newMessage.length <= MAX_MESSAGE_LENGTH) {
      setMessage(newMessage);
      handleTypingStatus();
    }
  };

  /**
   * Manages typing status with debounce
   */
  const handleTypingStatus = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      emitTyping();
    }
    
    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      emitStopTyping();
    }, TYPING_TIMEOUT);
  }, [isTyping]);

  /**
   * Emits typing event to other users
   */
  const emitTyping = useCallback(() => {
    if (socket?.connected && roomId && auth?.user?.username) {
      socket.emit('typing', { user: auth.user.username, room: roomId });
    }
  }, [socket, roomId, auth?.user?.username]);

  /**
   * Emits stop typing event to other users
   */
  const emitStopTyping = useCallback(() => {
    if (socket?.connected && roomId && auth?.user?.username) {
      socket.emit('stopTyping', { user: auth.user.username, room: roomId });
    }
  }, [socket, roomId, auth?.user?.username]);

  /**
   * Adds an emoji to the current message
   * @param {Object} emojiObject - Emoji data object
   */
  const handleEmojiClick = useCallback((emojiObject) => {
    setMessage(prevMessage => {
      const newMessage = prevMessage + emojiObject.emoji;
      return newMessage.length <= MAX_MESSAGE_LENGTH ? newMessage : prevMessage;
    });
  }, []);

  /**
   * Toggles the emoji picker
   */
  const toggleEmojiPicker = useCallback(() => {
    setShowEmojiPicker(prev => !prev);
  }, []);

  /**
   * Auto-resizes the input field based on content
   */
  const handleInputResize = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, []);

  /**
   * Sends a message to the chat room
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    
    if (trimmedMessage === '' || !socket?.connected || isSubmitting) return;
    
    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      toast.error(`Message length should be less than ${MAX_MESSAGE_LENGTH} characters`);
      return;
    }

    try {
      setIsSubmitting(true);
      
      // First emit the message for real-time display
      socket.emit('message-sent', { 
        message: trimmedMessage, 
        user: auth?.user?.username, 
        room: roomId 
      });
      
      // Clear the input field immediately for better UX
      setMessage('');
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
      
      // Then save to database
      const res = await sendMessage(trimmedMessage, roomId, auth?.token);
      
      return;
    } catch (error) {
      toast.error('Error sending message. Please try again.');
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      emitStopTyping();
    }
  };

  /**
   * Leaves the current chat room
   */
  const leaveRoom = useCallback(() => {
    if (socket?.connected && roomId && auth?.user?.username) {
      socket.emit('leaveRoom', { 
        roomId, 
        user: auth.user.username, 
        roomMembers 
      });
    }
  }, [socket, roomId, auth?.user?.username, roomMembers]);

  /**
   * Shows the confirmation modal for leaving the room
   */
  const showModel = useCallback(() => {
    const btn = document.getElementById('queryBtn');
    if (btn) btn.click();
  }, []);

  /**
   * Handles socket connection error and reconnection attempts
   */
  const handleConnectionError = useCallback(() => {
    setConnectionError('Lost connection to chat server. Attempting to reconnect...');
    
    // Clear any existing timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    // Set new timeout for reconnection attempt
    reconnectTimeoutRef.current = setTimeout(() => {
      if (socket) {
        socket.connect();
        if (socket.connected && roomId && auth?.user?.username) {
          socket.emit('joinRoom', roomId, auth.user.username);
          setConnectionError(null);
        } else {
          handleConnectionError(); // Try again if still not connected
        }
      }
    }, RECONNECT_TIMEOUT);
  }, [socket, roomId, auth?.user?.username]);

  /**
   * Sets up socket event listeners
   */
  useEffect(() => {
    if (!socket) return;

    // Connection status
    const handleConnect = () => {
      setConnectionError(null);
      // Rejoin room on reconnect
      if (roomId && auth?.user?.username) {
        socket.emit('joinRoom', roomId, auth.user.username);
      }
    };

    const handleDisconnect = () => {
      handleConnectionError();
    };

    // Message-related events
    const handleMessageReceived = (data) => {
      if (data && data.message) {
        setSocketMessages(prev => [...prev, data]);
      }
    };

    // Room-related events
    const handleJoinRoom = (data) => {
      if (data) {
        setRoomEventHappened(prev => !prev);
        setSocketMessages(prev => [...prev, data]);
        setRoomMembers(data.roomMembers || []);
        setNoOfMembers(data.roomMembersCount || 0);
      }
    };

    const handleDisconnectedFromRoom = (data) => {
      if (data) {
        setRoomEventHappened(prev => !prev);
        setSocketMessages(prev => [...prev, data]);
        setRoomMembers(data.roomMembers || []);
        setNoOfMembers(data.roomMembersCount || 0);
      }
    };

    const handleLeaveRoom = (data) => {
      if (data) {
        setRoomEventHappened(prev => !prev);
        setSocketMessages(prev => [...prev, data]);
        setRoomMembers(data.roomMembers || []);
        setNoOfMembers(data.roomMembersCount || 0);
      }
    };

    // Typing indicators
    const handleTyping = (data) => {
      if (data) setTypingUsers(data);
    };

    const handleStopTyping = () => {
      setTypingUsers('');
    };

    // Error handling
    const handleError = (error) => {
      console.error('Socket error:', error);
      toast.error('Connection error. Trying to reconnect...');
      handleConnectionError();
    };

    // Register event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('message-received', handleMessageReceived);
    socket.on('joinRoom', handleJoinRoom);
    socket.on('disconnected-from-room', handleDisconnectedFromRoom);
    socket.on('leaveRoom', handleLeaveRoom);
    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);
    socket.on('error', handleError);

    // Clean up
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('message-received', handleMessageReceived);
      socket.off('joinRoom', handleJoinRoom);
      socket.off('disconnected-from-room', handleDisconnectedFromRoom);
      socket.off('leaveRoom', handleLeaveRoom);
      socket.off('typing', handleTyping);
      socket.off('stopTyping', handleStopTyping);
      socket.off('error', handleError);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [socket, roomId, auth?.user?.username, handleConnectionError, setRoomEventHappened]);

  // Join room on component mount
  useEffect(() => {
    if (socket?.connected && roomId && auth?.user?.username) {
      socket.emit('joinRoom', roomId, auth.user.username);
    }
    
    return () => {
      // Clean up on unmount
      if (socket?.connected && roomId && auth?.user?.username) {
        socket.emit('leaveRoom', { roomId, user: auth.user.username });
      }
    };
  }, [socket, roomId, auth?.user?.username]);

  // Fetch message history from database
  useEffect(() => {
    const getMessages = async () => {
      try {
        const token = getLocalStorageWithExpiry('auth')?.token;
        if (!token || !roomId) return;
        
        const res = await fetchMessages(roomId, token);
        
        if (res.status === 200 && Array.isArray(res.data)) {
          const messages = res.data.map(msg => ({
            message: msg.content,
            user: msg.user,
            isSystemMessage: false
          }));
          
          setSocketMessages(prev => {
            // Filter out duplicates by checking message content
            const existingIds = new Set(prev.map(m => 
              m.user?.username && m.message ? `${m.user.username}:${m.message}` : null
            ).filter(Boolean));
            
            const uniqueMessages = messages.filter(m => 
              !existingIds.has(`${m.user?.username}:${m.message}`)
            );
            
            return [...prev, ...uniqueMessages];
          });
        } else if (res.status === 500) {
          toast.error(res.message || 'Failed to fetch messages');
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load message history');
      }
    };
    
    getMessages();
  }, [roomId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [socketMessages]);

  // Check for authentication
  useEffect(() => {
    const authData = getLocalStorageWithExpiry('auth');
    if (!authData?.token) {
      toast.error('Please login to access chat rooms');
      navigate('/login');
    }
  }, [navigate]);

  // Message invitation text
  const chatRoomInvitationText = `Hey, I'm inviting you to join the chat room ${roomName} on Chat Nest App - ${extractBaseUrl(window.location.href)} ask me for the password when it is prompted.`;

  return (
    <>
      {/* Leave Room Confirmation Modal */}
      <ReactRouterPrompt when={true}>
        {({ isActive, onConfirm, onCancel }) => (
          <>
            {isActive && showModel()}
            <div className="modal fade" id="confirmModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h1 className="modal-title fs-5" id="exampleModalLabel">Confirm Action</h1>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                  </div>
                  <div className="modal-body">
                    Are you sure you want to leave the room {roomName}?
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={onCancel}>No</button>
                    <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={() => { onConfirm(); leaveRoom(); }}>Yes</button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </ReactRouterPrompt>

      <button type="button" style={{ display: "none" }} id="queryBtn" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#confirmModal">
        Launch demo modal
      </button>

      <div className="container my-5">
        <div className="row d-flex justify-content-center align-items-center">
          {/* Connection error banner */}
          {connectionError && (
            <div className="alert alert-warning" role="alert">
              {connectionError}
            </div>
          )}
          
          <div className="form-control" style={{ maxWidth: "50em", height: "80vh", border: "2px solid black", display: "flex", flexDirection: "column" }}>
            {/* Chat Room Header */}
            <div className="card-header" style={{ borderBottom: "2px solid black", minHeight: "4em", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span className="text-center">
                <span className="">{roomName}'s ROOM</span>&nbsp;
                {typingUsers?.length > 0 && !isTyping ? (
                  <span className="text-muted"><i> {typingUsers} is typing...</i></span>
                ) : null}
              </span>

              <div className="d-flex flex-row-reverse">
                <button className="btn btn-dark me-2" data-bs-toggle="modal" data-bs-target="#showMembers">
                  {noOfMembers} &nbsp;
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-people" viewBox="0 0 16 16">
                    <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022ZM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />
                  </svg>
                </button>
                <span className="me-2"><CopyButton textToCopy={chatRoomInvitationText} /></span>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div className="card-body d-flex flex-column">
              <div
                ref={messagesContainerRef}
                className="flex-grow-1 overflow-auto"
                style={{ maxHeight: '55vh' }}
              >
                {socketMessages.map((msg, index) => (
                  <ChatBubble 
                    key={`${msg?.user?.username || 'system'}-${index}`}
                    isSent={msg?.user?.username ? msg?.user?.username === auth?.user?.username : true}
                    sender={msg?.user?.username}
                    message={msg?.message}
                    system={msg?.isSystemMessage} 
                  />
                ))}
              </div>
              
              {/* Message Input Area */}
              <div className="row align-items-end">
                <div className="col">
                  <form onSubmit={handleSubmit} className="input-group">
                    <textarea
                      ref={inputRef}
                      className="form-control"
                      placeholder="Type your message..."
                      value={message}
                      onChange={handleChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(e);
                        }
                      }}
                      onBlur={emitStopTyping}
                      style={{ minHeight: '10px', maxHeight: '120px', overflowY: 'auto' }}
                    />
                    <div className="input-group-append mx-2">
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary" 
                        onClick={toggleEmojiPicker}
                        aria-label="Emoji picker"
                      >
                        😊
                      </button>
                    </div>
                    <div className="input-group-append">
                      <button 
                        type="submit" 
                        disabled={!message.trim() || isSubmitting || !socket?.connected} 
                        className="btn btn-primary"
                      >
                        {isSubmitting ? (
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : 'Send'}
                      </button>
                    </div>
                  </form>
                  {message.length > 0 && (
                    <small className={`text-${message.length > MAX_MESSAGE_LENGTH ? 'danger' : 'muted'}`}>
                      {message.length}/{MAX_MESSAGE_LENGTH}
                    </small>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Emoji Picker */}
          <div className="col-2 emojiBox">
            {showEmojiPicker && (
              <div className="emoji-picker-container">
                <EmojiPicker 
                  onEmojiClick={handleEmojiClick}
                  searchDisabled={false}
                  previewConfig={{ showPreview: false }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Room Members Modal */}
      <div className="modal fade" id="showMembers" tabIndex={-1} aria-labelledby="showMemLbl" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="showMemLbl">Current Room Members</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
            </div>
            <div className="modal-body">
              {roomMembers.length > 0 ? (
                <ul className="list-group">
                  {roomMembers.map((user, index) => (
                    <li key={index} className="list-group-item">
                      {user === auth?.user?.username ? `${user} (You)` : user}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No members in this room yet.</p>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatRoom;