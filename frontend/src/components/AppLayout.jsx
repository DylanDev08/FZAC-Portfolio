import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import WhatsAppButton from './WhatsAppButton.jsx';

export default function AppLayout() {
  const location = useLocation();
  const isAdminArea = location.pathname.startsWith('/admin');

  if (isAdminArea) {
    return <Outlet />;
  }

  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      <WhatsAppButton />
    </>
  );
}
