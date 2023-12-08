import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/authContext';
import { UpdateProvider } from './context/hasUpdated'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <UpdateProvider>
        <App />
      </UpdateProvider>
    </AuthProvider>
  </React.StrictMode>,
)
