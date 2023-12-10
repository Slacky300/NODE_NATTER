import React from 'react'

import { Outlet } from 'react-router-dom';
import Navbar  from '../../components/Navbar';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from '../Auth/Login';
import { getLocalStorageWithExpiry } from '../../helpers/auth/authFn';
const Layout = () => {

    const token = getLocalStorageWithExpiry('auth')?.token;
   

    return (
        <>
            <header><Navbar/></header>
           
                {token? <Outlet /> : <Login/>}

            
                
                        
              
     
       

            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </>
    )
}

export default Layout