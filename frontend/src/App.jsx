import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./App.css";
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";
import ChatRoom from "./Pages/Main/ChatRoom";
import AllRooms from "./Pages/Main/AllRooms";
import Layout from "./Pages/Main/Layout";
import LandingPage from "./Pages/Main/LandingPage";
import ReactGA from "react-ga";
const TRACKING_ID = "G-DVVJ3Q0KH7"; // OUR_TRACKING_ID
ReactGA.initialize(TRACKING_ID);
function App() {
  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        { path: "/", element: <LandingPage /> },
        { path: "/login", element: <Login /> },
        { path: "/register", element: <Register /> },
        { path: "/rooms", element: <AllRooms /> },
        { path: "/chat/:roomId/:roomName", element: <ChatRoom /> },
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
