import message from "../../../../models/message";

export const sendMessage = async (content, room, token) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        
      },
      body: JSON.stringify({ content , room})
    });
    if (res.status === 201) {
     
      return true;
    }else{
        return false;
    }

    
  } catch (err) {
    return false;
  }
}


export const fetchMessages = async (roomId, token) => {

  try {
    const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/messages/${roomId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        
      },
    });
    const data = await res.json();
    if (res.status === 200) {
     
      return {data: data.messages, error: null, status: res.status};
    }
    return {data: [],status: res.status};
  } catch (err) {
    return {data: [],status: 500, message: "Something went wrong"};
  }
}