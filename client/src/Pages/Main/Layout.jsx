import React from 'react'

import { Outlet } from 'react-router-dom';
import Navbar  from '../../components/Navbar';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const Layout = () => {

    const token = localStorage.getItem('token')
   

    return (
        <>
            <header><Navbar/></header>
           
                <Outlet />

            
                
                        
              
     
       

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