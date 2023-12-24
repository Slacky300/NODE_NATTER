import { createContext, useContext, useEffect } from "react";
import { useUpdate } from "./hasUpdated";
import { io } from 'socket.io-client';

const SocketContext = createContext();

const SocketProvider = ({ children }) => {
    const socket = io(import.meta.env.VITE_APP_SOCKET_URL);
    const { roomEventHappened, setRoomEventHappened } = useUpdate();

    useEffect(() => {
        const handleJoinRoom = () => {
            setRoomEventHappened(prevState => !prevState);
        };

        const handleLeaveRoom = () => {
            setRoomEventHappened(prevState => !prevState);
        };

        const handleDisconnectedFromRoom = () => {
            setRoomEventHappened(prevState => !prevState);
        };

        socket.on('joinRoom', handleJoinRoom);
        socket.on('leaveRoom', handleLeaveRoom);
        socket.on('disconnected-from-room', handleDisconnectedFromRoom);

        return () => {
            // Cleanup event listeners when the component unmounts
            socket.off('joinRoom', handleJoinRoom);
            socket.off('leaveRoom', handleLeaveRoom);
            socket.off('disconnected-from-room', handleDisconnectedFromRoom);
        };
    }, [socket, roomEventHappened]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

const useSocket = () => useContext(SocketContext);

export { useSocket, SocketProvider };
