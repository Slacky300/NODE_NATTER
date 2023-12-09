import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Private from './components/PrivateRoutes';
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Register';
import ChatRoom from './Pages/Main/ChatRoom';
import AllRooms from './Pages/Main/AllRooms';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './Pages/Main/Layout';


function App() {

   
  const router = createBrowserRouter([
    {
      path: '/', element: <Layout />,
      children: [
        { path: '/rooms', element: <AllRooms /> },
        { path: '/login', element: <Login /> },
        { path: '/register', element: <Register /> },
        { path: '/chat/:roomId/', element: <ChatRoom /> },
      ]
    },

  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
