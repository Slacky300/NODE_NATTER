import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import './App.css';
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Register';
import ChatRoom from './Pages/Main/ChatRoom';
import AllRooms from './Pages/Main/AllRooms';
import Layout from './Pages/Main/Layout';
import LandingPage from './Pages/Main/LandingPage';

function App() {

  const router = createBrowserRouter([
    {
      path: '/',
      element: <Layout />,
      children: [
        { path: '/', element: <LandingPage /> },
        { path: '/login', element: <Login /> },
        { path: '/register', element: <Register /> },
        { path:  '/rooms', element: <AllRooms /> },
        { path:  '/chat/:roomId/' , element:<ChatRoom />  },
      ],
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
