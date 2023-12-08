export const fetchAllActiveRooms = async (token) => {


    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/rooms`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
        if (res.status === 200) {
            const data = await res.json();
            return data.rooms;
        }
    
        return [];
    } catch (err) {
        return [];
    }
};


export const verifyRoomPassword = async (roomId, roomPassword, token) => {

    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/rooms/join/${roomId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ roomPassword }),
        });
        if(res.status === 401){
            return {error: 'Incorrect Password', status: 401}
        }else if(res.status === 404){
            
            return {error: 'Room Not Found', status: 404};
        }
        
        if(res.status === 200){

            const data = await res.json();
            return {data: data.room._id, status: 200};
         }

    } catch (err) {
        return {error: 'Something went wrong', status: 500};
    }
}


export const createRoom = async (roomName, maxUsers, roomPassword, token) => {

    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/rooms/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ roomName, roomPassword, maxUsers }),
        });
        const data = await res.json();  
        if(res.status === 409){
            return {error: data.message, status: 409}
        }else if(res.status === 201){
            
            return {message: data.message, status: 201, data: data.newRoom};
        }
        return {error: 'Something went wrong', status: 500};
        
    
    } catch (err) {
        return {error: 'Something went wrong', status: 500};
    }
}
