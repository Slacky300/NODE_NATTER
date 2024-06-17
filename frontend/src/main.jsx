import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/authContext';
import { UpdateProvider } from './context/hasUpdated'
import { SocketProvider } from './context/socketContext.jsx';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <UpdateProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </UpdateProvider>
    </AuthProvider>
  </React.StrictMode>,
)
