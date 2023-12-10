import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import socket from '../../../config.js';
import { useNavigate, useParams } from 'react-router-dom';
import ChatBubble from '../../components/ChatBubble.jsx';
import { fetchMessages, sendMessage } from '../../helpers/chats/chatFn.jsx';
import ReactRouterPrompt from 'react-router-prompt';
import { getLocalStorageWithExpiry } from '../../helpers/auth/authFn.jsx';
import CopyButton from '../../components/CopyButton.jsx';
import { useUpdate } from '../../context/hasUpdated.jsx';
import { verifyRoomPassword } from '../../helpers/room/roomFn.jsx';


const ChatRoom = () => {


  const { auth} = useAuth();
  const navigate = useNavigate();
  const { roomId, roomName } = useParams();
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


  
    //To join the respective room on page load
    useEffect(() => {

      socket.emit('joinRoom', roomId, auth?.user?.username);
      return () => {
        socket.off('joinRoom');
      };

    }, [roomId, auth?.user?.username]);

  


  //This useEffect is to listen to the socket events
  useEffect(() => {


    //This event is to listen to the messages sent by other users
    socket.on('message-received', (data) => {
      setSocketMessages((prevMessages) => [...prevMessages, data]);
    });


    //This event is triggered when a user joins the room
    socket.on('joinRoom', (data) => {
      setSocketMessages((prevMessages) => [...prevMessages, data]);
      setRoomMembers(data.roomMembers);
    })

    //This event is triggered when a user leaves the room
    socket.on('disconnected-from-room', (data) => {
      setSocketMessages((prevMessages) => [...prevMessages, data]);
      setRoomMembers(data.roomMembers);


    });

    //This is to emit the typing event
    socket.on('typing', (data) => {
      setTypingUsers(data);
    });


    //This is to emit the stopTyping event
    socket.on('stopTyping', (data) => {
      setTypingUsers('');
      console.log(typingUsers);
    });




    //This is to remove the event listeners
    return () => {
      socket.off('message-received');
      socket.off('joinRoom');
      socket.off('disconnected-from-room');
      socket.off('typing');
      socket.off('stopTyping');
    };
  }, [socket]);


  //This useEffect is to fetch the messages from the database
  useEffect(() => {

    const getMessages = async () => {

      const res = await fetchMessages(roomId, getLocalStorageWithExpiry('auth')?.token);
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


  //This function is to handle the submit event i.e. when the user sends a message it submits the message to the server
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (message.trim() === '') return;

    try {


      //This is to emit the message to the server
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

  //This function is to show the confirmation modal i.e when the user trys to leave the chat room
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

  //This useEffect is to emit the stopTyping event when the user stops typing
  useEffect(() => {

    if (message.trim() === '') {
      stopTyping();
    }
  }, [message]);

  useEffect(() => {

    if (!getLocalStorageWithExpiry('auth')?.token) {
      navigate('/login')
    }
  

  }, [])




  

  const chatRoomInvitationText = `Hey, I'm inviting you to join the chat room ${roomName} on Chat Nest. Ask me for the password if you need it.`



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
                          Are you sure you want to leave the room {roomName}?
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
              <div className='card ' style={{ maxWidth: "50em", height: "80vh", border: "2px solid black" }}>
                <div className='card-header '>

                  <span className='text-center'> 
                    <span className='display-6'>{roomName}'s ROOM</span> &nbsp;
                    {typingUsers?.length > 0 && !isTyping ? (
                      <span className='text-muted'><i> {typingUsers} is typing...</i></span>
                    ) : (
                      <></>
                    )}
                  </span>

                  <button className="btn btn-dark float-end" data-bs-toggle="modal" data-bs-target="#showMembers" >Room Members</button>
                  <span className='float-end mx-3'><CopyButton textToCopy={chatRoomInvitationText} /></span>


                </div>
                <div className='card-body d-flex flex-column'>
                  {/* Chat messages container */}
                  <div
                    ref={messagesContainerRef}
                    className='flex-grow-1 overflow-auto'
                    style={{ maxHeight: '55vh' }}
                  >
                    {/* Display chat messages here */}
                    {socketMessages && socketMessages?.map((msg, index) => (
                      <ChatBubble key={index}
                        isSent={msg?.user?.username ? msg?.user?.username === auth?.user?.username : true}
                        sender={msg?.user?.username}
                        message={msg?.message}
                        system={msg?.isSystemMessage} />
                    ))}
                  </div>
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

          <div className="modal fade" id="showMembers" tabIndex={-1} aria-labelledby="showMemLbl" aria-hidden="true">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h1 className="modal-title fs-5" id="showMemLbl">Current Room Members</h1>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                </div>
                <div className="modal-body">
                  <ul>
                    {roomMembers && Object.values(roomMembers).map((user, index) => (
                      <li key={index}>{user?.username}</li>
                    ))}

                  </ul>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>


        </>
      





  );
}

export default ChatRoom;
