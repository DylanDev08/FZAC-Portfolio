import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';

const Home = lazy(() => import('./pages/Home.jsx'));
const Projects = lazy(() => import('./pages/Projects.jsx'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Admin = lazy(() => import('./pages/Admin.jsx'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute.jsx'));
const Events = lazy(() => import('./pages/Events.jsx'));
const EventDetail = lazy(() => import('./pages/EventDetail.jsx'));
const WorkDetail = lazy(() => import('./pages/WorkDetail.jsx'));

function PageLoader() {
  return (
    <main className="error-screen">
      <div className="container">
        <span className="eyebrow">Cargando</span>
        <h1>Preparando el portfolio.</h1>
        <p>Estamos cargando el contenido de Fortaleza Construcciones.</p>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
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
  );
}
