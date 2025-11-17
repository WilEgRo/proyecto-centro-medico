import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './router/Protected.Route';

// --- Importación de Vistas (las crearemos ahora) ---
import LoginPage from './pages/LoginPage';
import DashboardLayout from './pages/DashboardLayout';

function App() {
  return (
    <Routes>
      {/* === RUTAS PÚBLICAS === */}
      {/* Solo se puede acceder si NO estás autenticado (lógica opcional) */}
      <Route path="/login" element={<LoginPage />} />

      {/* === RUTAS PRIVADAS === */}
      {/* Usamos nuestro 'ProtectedRoute' como un "wrapper" */}
      <Route element={<ProtectedRoute />}>
        {/* Todas las rutas aquí dentro están protegidas */}
        
        {/* Usamos "/*" para que cualquier ruta (ej. /admin, /medico) 
            sea manejada por nuestro DashboardLayout */}
        <Route path="/*" element={<DashboardLayout />} />
      </Route>
    </Routes>
  )
}

export default App