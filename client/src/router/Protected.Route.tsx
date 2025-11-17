import { useAuth } from "../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Si estamos "cargando" (verificando el token), mostramos un aviso
  // Esto evita un "parpadeo" donde se redirige a login antes de tiempo
  if (loading) {
    return <div>Cargando sesión...</div>;
  }

  // Si no está autenticado (y ya no está cargando), redirigir
  if (!isAuthenticated) {
    // 'replace' evita que el usuario pueda "volver" al login con el botón atrás
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderiza el contenido de la ruta anidada
  // 'Outlet' es el marcador de posición para las rutas hijas
  return <Outlet />;
};