import { createContext, useContext, useState } from 'react';

const UpdateContext = createContext();

export const UpdateProvider = ({ children }) => {
  const [shouldUpdate, setShouldUpdate] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [activeMembers, setActiveMembers] = useState([]); // [
  const [loading, setLoading] = useState(false);
  const [roomWiseActiveMembers, setRoomWiseActiveMembers] = useState({
    // room_id: [user_id]
  }); 

  const triggerUpdate = () => {
    setShouldUpdate(prev => !prev);
  };


  return (
    <UpdateContext.Provider value={{ shouldUpdate, triggerUpdate, rooms, setRooms, loading, setLoading, activeMembers, setActiveMembers,
      roomWiseActiveMembers, setRoomWiseActiveMembers }}>
      {children}
    </UpdateContext.Provider>
  );
};

export const useUpdate = () => useContext(UpdateContext);