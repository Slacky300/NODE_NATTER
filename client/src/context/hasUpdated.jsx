import { createContext, useContext, useState } from 'react';

const UpdateContext = createContext();

export const UpdateProvider = ({ children }) => {
  const [shouldUpdate, setShouldUpdate] = useState(false);
  const [rooms, setRooms] = useState([]);

  const triggerUpdate = () => {
    setShouldUpdate(prev => !prev);
  };


  return (
    <UpdateContext.Provider value={{ shouldUpdate, triggerUpdate, rooms, setRooms }}>
      {children}
    </UpdateContext.Provider>
  );
};

export const useUpdate = () => useContext(UpdateContext);