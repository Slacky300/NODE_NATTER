import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';
import { fetchAllActiveRooms, verifyRoomPassword, createRoom, deleteRoom, editRoomPassword } from '../../helpers/room/roomFn.jsx';
import { toast } from 'react-toastify';
import { useUpdate } from '../../context/hasUpdated.jsx';
import { getLocalStorageWithExpiry } from '../../helpers/auth/authFn.jsx';
import socket from '../../../config.js';

const AllRooms = () => {


    const token = getLocalStorageWithExpiry('auth')?.token;
    const { auth, setHasEnteredPassword } = useAuth();
    const [roomId, setRoomId] = useState('');
    const { rooms, setRooms, loading, setLoading, roomWiseActiveMembers, setRoomWiseActiveMembers } = useUpdate();
    const navigate = useNavigate();
    const [editedRoomPassword, setEditedRoomPassword] = useState('');
    const [cnfrmEditedRoomPassword, setCnfrmEditedRoomPassword] = useState('');
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
        if (roomName.length < 3) {
            toast.warning('Room name must be at least 3 characters long');
            return;
        } else if (roomName.length > 30) {
            toast.warning('Room name must be less than 30 characters long');
            return;
        } else if (roomUsers < 2) {
            toast.warning('Room must have at least 2 members');
            return;
        } else if (roomUsers > 10) {
            toast.warning('Room must have less than 10 members');
            return;
        } else if (roomCreatePassword.length < 6) {
            toast.warning('Room password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        const res = await createRoom(roomName, roomUsers, roomCreatePassword, token).finally(() => setLoading(false));
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
        setLoading(true);
        const res = await verifyRoomPassword(roomId, roomPassword, token).finally(() => setLoading(false));
        if (res.status === 200) {
            setHasEnteredPassword(true);
            navigate(`/chat/${res.data}/${res.name}`);
        } else {
            toast(res.error, { type: 'error' });
        }

    }

    const handleDelete = async (roomId) => {
        setLoading(true);
        const res = await deleteRoom(roomId, token).finally(() => setLoading(false));
        if (res.status === 200) {
            toast(res.message, { type: 'success' });
            setRooms(rooms.filter((room) => room._id !== roomId));
        } else {
            toast(res.error, { type: 'error' });
        }
    }

    useEffect(() => {

        if (!token) {
            navigate('/login')
        }

    }, [auth?.username])

    useEffect(() => {
        const fetchRooms = async () => {
            setLoading(true);
            const data = await fetchAllActiveRooms(token).finally(() => setLoading(false));
            setRooms(data);
        }
        fetchRooms();
    }, [])


 




    const handleEditPassword = async (e) => {
        e.preventDefault();
        if (editedRoomPassword.length < 6) {
            toast.warning('Room password must be at least 6 characters long');
            return;
        } else if (editedRoomPassword !== cnfrmEditedRoomPassword) {
            toast.warning('Room password and confirm room password must be same');
            return;
        }

        setLoading(true);
        const res = await editRoomPassword(roomId, editedRoomPassword, token).finally(() => setLoading(false));
        if (res.status === 200) {
            toast(res.message, { type: 'success' });
        } else {
            toast(res.error, { type: 'error' });
        }
    }

    return (

        <>
            <div className='container'>
                <div className='row my-3 d-flex justify-content-center align-items-center'>
                    <div className='col-12'>
                        <h6 className='display-6'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-info-circle" viewBox="0 0 16 16">
                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
                            </svg>
                            &nbsp; Hello <b>{auth?.user?.username}</b>, Get Started by joining a room</h6>
                    </div>
                    {rooms?.map((room, index) => (
                        <div key={index} className="card mx-5 my-5" style={{ width: '18rem' }}>
                            <div className="card-body">

                                <div className='d-flex justify-content-between align-items-between'>
                                    <h5 className="card-title">{room.roomName}</h5>
                                    {auth?.user?.username === room.roomCreator.username &&
                                        <button type="button"
                                            disabled={loading}
                                            onClick={() => setRoomId(room._id)}
                                            className="btn btn-dark" data-bs-toggle="modal" data-bs-target={`#editPasswordModal`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
                                                <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708l-1.585-1.585z" />
                                            </svg>
                                        </button>
                                    }
                                </div>

                                <h6 className="card-subtitle mb-2 text-body-secondary">Members : {room?.users?.length}/{room?.maxUsers}</h6>
                                <p className="card-text">Created By: {room.roomCreator.username}</p>
                                <div className='d-flex justify-content-end'>
                                    {auth?.user?.username === room.roomCreator.username &&
                                        <button type="button"
                                            disabled={loading}
                                            onClick={() => handleDelete(room._id)}

                                            className="btn btn-danger mx-2 text-center">

                                            <span className='text-center'>
                                                &nbsp;
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                                                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                                                </svg>
                                            </span>

                                        </button>}

                                    <button disabled={loading} onClick={() => setRoomId(room._id)} type="button" className="btn btn-success text-center" data-bs-toggle="modal" data-bs-target="#exampleModal">
                                        <span className='text-center'>
                                            <svg xmlns="http://www.w3.org/2000/svg"
                                                width="16" height="16" fill="currentColor" className="bi bi-plus-lg" viewBox="0 0 16 16">
                                                <path fill-rule="evenodd"
                                                    d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
                                            </svg>
                                        </span>
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
                                    <button disabled={loading} type="submit" data-bs-dismiss="modal" className="btn btn-primary my-2">Submit</button>
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
                                    <button disabled={loading} type="submit" className="btn btn-primary my -2">Submit</button>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>

            <div className="modal fade" id="editPasswordModal" tabIndex={-1} aria-labelledby="editModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="editModalLabel">Edit Room Password</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleEditPassword}>
                                <div className="form-group">
                                    <label htmlFor="roomPassword">Room Password</label>
                                    <input type="password" name="editedRoomPassword" onChange={(e) => setEditedRoomPassword(e.target.value)} value={editedRoomPassword} className="form-control" id="roomPassword" placeholder="Enter Room Password" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="roomPassword">Confirm Room Password</label>
                                    <input type="password" name="cnfrmEditedRoomPassword" onChange={(e) => setCnfrmEditedRoomPassword(e.target.value)} value={cnfrmEditedRoomPassword} className="form-control" id="roomPassword" placeholder="Enter Room Password" />
                                </div>
                                <div className='d-flex justify-content-end'>
                                    <button disabled={loading} type="submit" data-bs-dismiss="modal" className="btn btn-primary my-2">Submit</button>
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