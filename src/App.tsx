import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import MovieCatalog from './pages/MovieCatalog';

// Wrapper para proteger as rotas que precisam de JWT
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('access_token');
  return token ? <>{children}</> : <Navigate to="/" />;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Rota Protegida (Só visualiza se tiver token) */}
        <Route 
          path="/movies" 
          element={
            <PrivateRoute>
              <MovieCatalog />
            </PrivateRoute>
          } 
        />
        
        {/* Redireciona qualquer Rota não encontrada de volta p/ raiz */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
