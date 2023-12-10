import React from 'react';
import { useAuth } from '../context/authContext';
import { Link, useNavigate } from 'react-router-dom'; 
import { getLocalStorageWithExpiry } from '../helpers/auth/authFn';
import Person from '../assets/icons/person-fill.svg';


const Navbar = () => {
  const token = getLocalStorageWithExpiry('auth')?.token;
  const navigate = useNavigate(); 
  const { auth, setAuth } = useAuth();
  const handleLogout = () => {
    localStorage.removeItem('auth');
    setAuth({
      ...auth,
      user: null,
      token: '',
    });
    navigate('/login'); 
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            Chat Nest &nbsp;{auth.user ? `- ${auth.user.username}` : ''}
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link active" aria-current="page" to="/">
                  Home
                </Link>
              </li>
              {token ? (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/rooms">
                      Rooms
                    </Link>
                  </li>
                  <li className="nav-item">
                   
                      <button className="btn btn-primary me-2 mb-2" data-bs-toggle="modal" data-bs-target="#createRoomModal">Create Room</button>
     
                  </li>
                  <li className="nav-item">
                    <button className="btn btn-danger" onClick={handleLogout}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-box-arrow-right" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
  <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
</svg>
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/login">
                      Login
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/register">
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
