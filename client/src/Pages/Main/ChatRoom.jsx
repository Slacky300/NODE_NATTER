import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import socket from '../../../config.js';
import { useParams } from 'react-router-dom';
import ChatBubble from '../../components/ChatBubble.jsx';
import { fetchMessages, sendMessage } from '../../helpers/chats/chatFn.jsx';
import { toast } from 'react-toastify';


const ChatRoom = () => {


  const { auth } = useAuth();
  const { roomId } = useParams();

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
      setSocketMessages((prevMessages) => [...prevMessages, data]);
    })

    window.addEventListener('beforeunload', (event) => {
      socket.emit('leaveRoom', roomId, auth?.user?.username);
    }
    );




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
    const handleBeforeUnload = (event) => {
      alert('You are leaving the chat room');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  },[]);

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

      const res = await sendMessage(message, roomId, auth?.token);

      if (res.status === 201) {
      } else {
        toast.error(res.message);
      }
      setMessage('');

    } catch (error) {
      console.error('Error sending message:', error);
    }
  };




  return (
    <>

     
      <div className='container my-5'>
        <div className='row d-flex mx-2 justify-content-center align-items-center'>
          <div className='card' style={{ maxWidth: "50em", height: "80vh" }}>
            <div className='card-header text-center'>
              <h1>CHAT ROOM</h1>
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
                  <>
                    <ChatBubble key={index}
                      isSent={msg.user.username ? msg?.user?.username === auth?.user?.username : true}
                      sender={msg?.user?.username}
                      message={msg.message}
                      system={msg.isSystemMessage} />
                  </>
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
                    onChange={handleChange}
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
