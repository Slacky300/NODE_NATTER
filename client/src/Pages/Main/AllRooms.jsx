import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';
import { fetchAllActiveRooms, verifyRoomPassword, createRoom, deleteRoom } from '../../helpers/room/roomFn.jsx';
import { toast } from 'react-toastify';
import { useUpdate } from '../../context/hasUpdated.jsx';


const AllRooms = () => {

    const {token} = JSON.parse(localStorage.getItem('auth'));
    const {auth} = useAuth();
    const [roomId, setRoomId] = useState('');
    const { rooms, setRooms } = useUpdate();
    const navigate = useNavigate();
    const [roomdetails, setRoomDetails] = useState({
        roomPassword: ''
    });
    const [roomCreateDetails, setRoomCreateDetails] = useState({
        roomName: '',
        roomUsers: '',
        roomCreatePassword: ''
    });

    const handleCreateChange = (e) => {
        const { id, value } = e.target;
        setRoomCreateDetails({ ...roomCreateDetails, [id]: value });
    }


    const handleChange = (e) => {
        const { id, value } = e.target;
        setRoomDetails({ ...roomdetails, [id]: value });
    }


    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        const { roomName, roomUsers, roomCreatePassword } = roomCreateDetails;
        const res = await createRoom(roomName, roomUsers, roomCreatePassword, token);
        if (res.status === 201) {
            toast(res.message, { type: 'success' });
            setRooms([...rooms, res.data]);
        } else if (res.status === 409) {
            toast(res.error, { type: 'error' });
        } else {
            toast(res.error, { type: 'error' });
        }
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        const { roomPassword } = roomdetails;
        const res = await verifyRoomPassword(roomId, roomPassword, token);
        if (res.status === 200) {
            navigate(`/chat/${res.data}`);
        } else if (res.status === 401) {
            toast(res.error, { type: 'error' });
        } else if (res.status === 404) {
            toast(res.error, { type: 'error' });
        } else {
            toast(res.error, { type: 'error' });
        }

    }

    const handleDelete = async (roomId) => {
        const res = await deleteRoom(roomId, token);
        if (res.status === 200) {
            toast(res.message, { type: 'success' });
            setRooms(rooms.filter((room) => room._id !== roomId));
        } else {
            toast(res.error, { type: 'error' });
        }
    }

    useEffect(() => {
        const fetchRooms = async () => {
            const data = await fetchAllActiveRooms(token);
            setRooms(data);
        }
        fetchRooms();
    }, [])

    return (
        <>
            <div className='container'>
                <div className='row my-3 d-flex justify-content-center align-items-center'>
                    <div className='col-12'>
                        <h1>All Rooms</h1>
                        {console.log(rooms)}
                    </div>
                    {rooms?.map((room, index) => (
                        <div key={index} className="card mx-5 my-5" style={{ width: '18rem' }}>
                            <div className="card-body">
                                <h5 className="card-title">{room.roomName}</h5>
                                <h6 className="card-subtitle mb-2 text-body-secondary">Members : {room?.users?.length}/{room.maxUsers}</h6>
                                <p className="card-text">Created By: {room.roomCreator.username}</p>
                                <div className='d-flex justify-content-end'>
                                {auth?.user?.username === room.roomCreator.username &&
                                 <button type="button" 
                                 onClick={() => handleDelete(room._id)}
                                 className="btn btn-danger mx-2">Delete</button>}
                                <button onClick={() => setRoomId(room._id)} type="button" className="btn btn-success" data-bs-toggle="modal" data-bs-target="#exampleModal">
                                    Join Room
                                </button>
                                
                                    </div>
                            </div>
                        </div>
                    ))}



                </div>
            </div>

          


            <div className="modal fade" id="exampleModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Join Room</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>

                                <div className="form-group">
                                    <label htmlFor="roomPassword">Room Password</label>
                                    <input type="password" onChange={handleChange} className="form-control" id="roomPassword" placeholder="Enter Room Password" />
                                </div>
                                <div className='d-flex justify-content-end'>
                                <button type="submit" data-bs-dismiss="modal" className="btn btn-primary my-2">Submit</button>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>



            <div className="modal fade" id="createRoomModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Create Room</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleCreateSubmit}>

                                <div className="form-group">
                                    <label htmlFor="roomName">Room Name</label>
                                    <input type="text" onChange={handleCreateChange} className="form-control" id="roomName" placeholder="Enter Room Name must be unique" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="roomUsers">Max Members limit:</label>
                                    <input type="number" onChange={handleCreateChange} className="form-control" id="roomUsers" placeholder="Enter Max members limit" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="roomCreatePassword">Room Password</label>
                                    <input type="password" onChange={handleCreateChange} className="form-control" id="roomCreatePassword" placeholder="Enter Room Password" />
                                </div>
                                <div className='d-flex justify-content-end'>
                                    <button type="submit" className="btn btn-primary">Submit</button>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>

        </>
    )
}

export default AllRooms