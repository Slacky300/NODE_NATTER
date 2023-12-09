import React from 'react';
import { useAuth } from '../context/authContext';
import { Link, useNavigate } from 'react-router-dom'; 

const Navbar = () => {
  const {auth, setAuth} = useAuth();
  const navigate = useNavigate(); 
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
            Socket Chat {auth.user ? ` - ${auth.user.username}` : ''}
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
              {auth.user ? (
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
                      Logout
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
