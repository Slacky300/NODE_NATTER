import { useAuth } from "../../context/authContext";


export const login = async (user) => {

    try {


        const { email, password } = user;

        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })

        });
        const data = await res.json();
        if (res.status === 200) {
            localStorage.setItem('auth', JSON.stringify(data));
            return {status: 200, user: data.user, token: data.token, message: data.message};
        }
        return {status: 500, message: data.message};

    } catch (error) {
        console.log(error);
    }
}

export const register = async (user) => {

    try {

        const { username, email, password } = user;

        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })

        });
        const data = await res.json();
        if (res.status === 201) {
            return {status: 201, message: data.message};
        }
        return {status: 400 , message: data.message};
    } catch (error) {
        return {status: 500, message: error.message};
    }
}