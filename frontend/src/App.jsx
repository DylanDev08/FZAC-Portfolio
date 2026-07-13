import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';
import ConstructionLoader from './components/ConstructionLoader.jsx';

const Home = lazy(() => import('./pages/Home.jsx'));
const Projects = lazy(() => import('./pages/Projects.jsx'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Admin = lazy(() => import('./pages/Admin.jsx'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute.jsx'));
const Events = lazy(() => import('./pages/Events.jsx'));
const EventDetail = lazy(() => import('./pages/EventDetail.jsx'));
const WorkDetail = lazy(() => import('./pages/WorkDetail.jsx'));

export default function App() {
  const [bootPhase, setBootPhase] = useState('building');

  useEffect(() => {
    const readyTimeout = globalThis.setTimeout(() => setBootPhase('ready'), 1700);
    const completeTimeout = globalThis.setTimeout(() => setBootPhase('complete'), 2400);
    return () => {
      globalThis.clearTimeout(readyTimeout);
      globalThis.clearTimeout(completeTimeout);
    };
  }, []);

  const isBooting = bootPhase !== 'complete';

  return (
    <>
      <BrowserRouter>
        <Suspense fallback={isBooting ? null : <ConstructionLoader />}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/proyectos" element={<Projects />} />
              <Route path="/obra/:slug" element={<ProjectDetail />} />
              <Route path="/eventos" element={<Events />} />
              <Route path="/eventos/:slug" element={<EventDetail />} />
              <Route path="/trabajos/:slug" element={<WorkDetail />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
      {isBooting && <ConstructionLoader ready={bootPhase === 'ready'} />}
    </>
  );
}
