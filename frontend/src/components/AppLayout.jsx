import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import WhatsAppButton from './WhatsAppButton.jsx';
export default function AppLayout(){return <><Navbar/><Outlet/><Footer/><WhatsAppButton/></>}
