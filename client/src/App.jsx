import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'
import Navbar from './components/Navbar'
import Private from './components/PrivateRoutes';
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Register';
import ChatRoom from './Pages/Main/ChatRoom';
import AllRooms from './Pages/Main/AllRooms';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {

  return (
    <>
      <Router>
        
        <Navbar />
        <ToastContainer />

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path='/' element={<Private />}>
          <Route path="/chat/:roomId" element={<ChatRoom />} />
          <Route path="/rooms" element={<AllRooms />} />


          </Route>
        </Routes>
      </Router>
    </>
  )
}

export default App
