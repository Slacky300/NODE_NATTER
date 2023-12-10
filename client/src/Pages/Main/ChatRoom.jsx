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
import { extractBaseUrl } from '../../helpers/room/roomFn.jsx';


const ChatRoom = () => {


  const { auth } = useAuth();
  const navigate = useNavigate();
  const { roomId, roomName } = useParams();
  const [isTyping, setIsTyping] = useState(false);
  const [roomMembers, setRoomMembers] = useState([]);
  const [typingUsers, setTypingUsers] = useState("");
  const [message, setMessage] = useState('');
  const { activeMembers, setActiveMembers } = useUpdate();


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
    // Inside the 'joinRoom' and 'disconnected-from-room' events
    socket.on('joinRoom', (data) => {
      setSocketMessages((prevMessages) => [...prevMessages, data]);
      setRoomMembers(data.roomMembers);
      setActiveMembers({
        room: {
          roomId: roomId,
        },
        user: data.roomMembersCount,
      })

    });

    socket.on('disconnected-from-room', (data) => {
      setSocketMessages((prevMessages) => [...prevMessages, data]);
      setRoomMembers(data.roomMembers);
      setActiveMembers({
        room: {
          roomId: roomId,
        },
        user: data.roomMembersCount,
      })
    });


    //This is to emit the typing event
    socket.on('typing', (data) => {
      setTypingUsers(data);
    });


    //This is to emit the stopTyping event
    socket.on('stopTyping', (data) => {
      setTypingUsers('');
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






  const chatRoomInvitationText = `Hey, I'm inviting you to join the chat room ${roomName} on Chat Nest App - ${extractBaseUrl(window.location.href)} ask me for the password when it is prompted.`



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
        <div className='row d-flex  justify-content-center align-items-center'>
          <div className='form-control' style={{ maxWidth: "50em", height: "80vh", border: "2px solid black", display: "flex", flexDirection: "column" }}>
            <div className='card-header' style={{ borderBottom: "2px solid black", minHeight: "4em", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span className='text-center'>
                <span className=''>{roomName}'s ROOM</span>&nbsp;
                {typingUsers?.length > 0 && !isTyping ? (
                  <span className='text-muted'><i> {typingUsers} is typing...</i></span>
                ) : (
                  <></>
                )}
              </span>

              <div className="d-flex flex-row-reverse">
                <button className="btn btn-dark me-2" data-bs-toggle="modal" data-bs-target="#showMembers">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-people" viewBox="0 0 16 16">
                    <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022ZM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />
                  </svg>
                </button>
                <span className='me-2'><CopyButton textToCopy={chatRoomInvitationText} /></span>
              </div>
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
      \

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
