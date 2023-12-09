import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import socket from '../../../config.js';
import { useParams } from 'react-router-dom';
import ChatBubble from '../../components/ChatBubble.jsx';
import { fetchMessages, sendMessage } from '../../helpers/chats/chatFn.jsx';
import ReactRouterPrompt from 'react-router-prompt';

const ChatRoom = () => {


  const { auth } = useAuth();
  const { roomId } = useParams();
  const [isTyping, setIsTyping] = useState(false);

  const [roomMembers, setRoomMembers] = useState([]);

  const [typingUsers, setTypingUsers] = useState("");

  const [message, setMessage] = useState('');
  const messagesContainerRef = useRef(null);
  const [socketMessages, setSocketMessages] = useState([{
    message: "Welcome to the chat room",
    user: {
      username: "System"
    },
    isSystemMessage: true,
  }]);


  const handleChange = (e) => {
    setMessage(e.target.value);
  }


  useEffect(() => {
    socket.emit('joinRoom', roomId, auth?.user?.username);


    return () => {
      socket.off('joinRoom');
    };
  }, [roomId, auth?.user?.username]);

  useEffect(() => {



    socket.on('message-received', (data) => {
      setSocketMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on('joinRoom', (data) => {
      setRoomMembers((prevMembers) => [...prevMembers, data.members]);
      setSocketMessages((prevMessages) => [...prevMessages, data]);
    })


    socket.on('disconnected-from-room', (data) => {
      setRoomMembers((prevMembers) => [...prevMembers, data.members]);
      setSocketMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on('typing', (data) => {
      setTypingUsers(data);
    });

    socket.on('stopTyping', (data) => {
      setTypingUsers('');
      console.log(typingUsers);
    });





    return () => {
      socket.off('message-received');
      socket.off('joinRoom');
      socket.off('leaveRoom');

    };
  }, [socket]);



  useEffect(() => {

    const getMessages = async () => {

      const res = await fetchMessages(roomId, JSON.parse(localStorage.getItem('auth')).token);
      if (res.status === 200) {
        const messages = res.data.map((msg) => {
          return {
            message: msg.content,
            user: msg.user,
            isSystemMessage: false

          }
        })
        setSocketMessages((prevMessages) => [...prevMessages, ...messages]);
        console.log(res.data);
      }

      if (res.status === 500) {
        toast.error(res.message);
      }
    }
    getMessages();
  }, [roomId, auth?.token]);



  useEffect(() => {
    // Scroll to the bottom when messages change
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [socketMessages]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (message.trim() === '') return;

    try {



      socket.emit('message-sent', { message, user: auth?.user?.username, room: roomId });

      const newMessage = message
      setMessage('');
      const res = await sendMessage(newMessage, roomId, auth?.token);

      if (res.status === 201) {
      } else {
        toast.error(res.message);
      }

    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const showModel = () => {
    const btn = document.getElementById('queyBtn');
    btn.click();
  }

  const leaveRoom = () => {
    socket.emit('leaveRoom', { roomId, user: auth?.user?.username, roomMembers: roomMembers });
  }

  const typing = () => {
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { user: auth?.user?.username, room: roomId });
    }
  };

  const stopTyping = () => {
    setIsTyping(false);
    socket.emit('stopTyping', { user: auth?.user?.name, room: roomId });
  };

  useEffect(() => {

    if (message.trim() === '') {
      stopTyping();
    }
  }, [message]);



  return (
    <>
      <ReactRouterPrompt when={true}>
        {({ isActive, onConfirm, onCancel }) => (
          <>
            {isActive && showModel()}
            <div>

              <div className="modal fade" id="confirmModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h1 className="modal-title fs-5" id="exampleModalLabel">Confirm Action</h1>
                      <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                    </div>
                    <div className="modal-body">
                      Are you sure you want to leave the chat room?
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={onCancel}>No</button>
                      <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={() => { onConfirm(); leaveRoom(); }}>Yes</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </>
        )}
      </ReactRouterPrompt>

      <button type="button" style={{ display: "none" }} id='queyBtn' className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#confirmModal">
        Launch demo modal
      </button>
      <div className='container my-5'>
        <div className='row d-flex mx-2  justify-content-center align-items-center'>
      <div className='card '  style={{ maxWidth: "50em", height: "80vh" , border: "2px solid black"}}>
        <div className='card-header text-center'>
         
          <span>
            CHAT ROOM &nbsp; 
            {typingUsers.length > 0 && !isTyping ? (
            <span className='text-muted'><i> {typingUsers} is typing...</i></span>
            ) : (
              <></>
            )}
          </span>
        </div>
        <div className='card-body d-flex flex-column'>
          {/* Chat messages container */}
          <div
            ref={messagesContainerRef}
            className='flex-grow-1 overflow-auto'
            style={{ maxHeight: '55vh' }}
          >
            {/* Display chat messages here */}
            {socketMessages && socketMessages.map((msg, index) => (
              <ChatBubble key={index}
                isSent={msg.user.username ? msg?.user?.username === auth?.user?.username : true}
                sender={msg?.user?.username}
                message={msg.message}
                system={msg.isSystemMessage} />
            ))}
          </div>
          {/* Input and Send button */}
          <div className='row align-items-end'>
            <div className='col'>
              <input
                type='text'
                className='form-control'
                placeholder='Type your message...'
                value={message}
                onChange={(e) => { handleChange(e), typing() }}
                onBlur={stopTyping}
              />
            </div>
            <div className='col-auto'>
              <button onClick={handleSubmit} className='btn btn-primary'>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
      </div>

    </>



  );
}

export default ChatRoom;
