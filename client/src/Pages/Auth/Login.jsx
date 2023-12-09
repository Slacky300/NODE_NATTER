import React, { useState } from 'react';
import { login } from '../../helpers/auth/authFn';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { toast } from 'react-toastify';
import { useUpdate } from '../../context/hasUpdated';


const Login = () => {

    const navigate = useNavigate();
    const {auth,setAuth} = useAuth();
    const {loading, setLoading} = useUpdate();

    const [userCreds, setUser] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setUser((prevUser) => ({
            ...prevUser,
            [e.target.id]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await login(userCreds).finally(() => setLoading(false));
        const { message, user, token, status } = result;

        if(status === 200){
            setAuth({
                ...auth,
                user,
                token
            })
            toast(message, {type: 'success'});
            navigate('/rooms');
            return;
        }

        toast(message, {type: 'error'});
    };

    return (
        <>
            <div className="container my-5" style={{ maxWidth: '50em' }}>
                <div className="row d-flex justify-content-center align-items-center">
                    <div className="col-6 d-flex justify-content-center align-items-center">
                        <h1>LOGIN</h1>
                    </div>
                </div>
                <div className="row my-5 d-flex justify-content-center align-items-center">
                    <div className="col-6">
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    id="email"
                                    value={userCreds.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="password"
                                    value={userCreds.password}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="my-3 d-flex justify-content-end">
                                <button disabled={loading} type="submit" className="btn btn-primary">
                                    {loading ? 'Logging In...' : 'Login'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;
