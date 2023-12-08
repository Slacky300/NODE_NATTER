import React, {useState} from 'react'
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const RoomForm = () => {


    const socket = io(import.meta.env.VITE_APP_SOCKET_URL);
    const [auth] = useAuth();

    const navigate = useNavigate();
    const [roomdetails, setRoomDetails] = useState({
        roomName: '',
        roomPassword: ''
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setRoomDetails({ ...roomdetails, [id]: value });
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const { roomName, roomPassword } = roomdetails;
        console.log(auth?.user._id)
        console.log(auth)
        if (roomName && roomPassword) {
            socket.emit('joinRoom', { roomName, roomPassword, userId: auth?.user._id });

            socket.on('roomDoesNotExists', (data) => {
                console.log(data);
                alert(data.message);
            })

            socket.on('roomPasswordIncorrect', (data) => {
                console.log(data);
                alert(data.message);
            })

            socket.on('youJoinedTheRoom', (data) => {
                console.log(data);
                alert(data.message);
                navigate(`/chat/${data.room}`);
            
            })
        }
    }
    return (
        <>
            <div className="container">
                <div className='row d-flex justify-content-center align-items-center'>
                    <div className='col-md-6'>
                        <h2>Room Form</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="roomName">Room Name</label>
                                <input type="text" onChange={handleChange} className="form-control" id="roomName" placeholder="Enter Room Name" />
                            </div>


                            <div className="form-group">
                                <label htmlFor="roomPassword">Room Password</label>
                                <input type="password" onChange={handleChange} className="form-control" id="roomPassword" placeholder="Enter Room Password" />
                            </div>
                            <button type="submit" className="btn btn-primary">Submit</button>
                        </form>
                    </div>


                </div>
            </div>
        </>
    )
}

export default RoomForm