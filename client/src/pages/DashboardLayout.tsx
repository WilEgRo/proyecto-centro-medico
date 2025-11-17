import { useAuth } from '../context/AuthContext';
import { type CSSProperties, Suspense } from 'react';
import { lazy } from 'react';

// importar los paneles usando lazy() para que el codigo de PanelAdmin.tsx solo descargue si el usuario es ADMIN
const PanelAdmin = lazy(() => import('./PanelAdmin'));
const PanelRecepcionista = lazy(() => import('./PanelRecepcionista'));
const PanelMedico = lazy(() => import('./PanelMedico'));

const DashboardLayout = () => {
  // Obtenemos el rol y la función de logout de nuestro contexto
  const { role, logout, user } = useAuth();

  // Función para decidir qué panel renderizar
  const renderPanelByRole = () => {
    switch (role) {
      case 'ADMIN':
        return <PanelAdmin />
      case 'RECEPCIONISTA':
        return <PanelRecepcionista />
      case 'MEDICO':
        return <PanelMedico />
      default:
        // Esto no debería pasar si estamos logueados
        return <div>Error: Rol no reconocido.</div>;
    }
  };

  return (
    <div>
      {/* Header (con estilos) */}
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Centro Médico Universitario</h1>
        <div style={styles.userInfo}>
          <span>Usuario: <strong>{user?.username}</strong> ({role})</span>
          <button onClick={logout} style={styles.logoutButton}>
            Cerrar Sesión
          </button>
        </div>
      </header>
      
      {/* Contenido principal envolver el panel en Suspense*/}
      <main style={styles.main}>
        <Suspense fallback={<div>Cargando panel...</div>}>
          {renderPanelByRole()}
        </Suspense>
      </main>
    </div>
  );
};

// --- Objeto de Estilos ---
const styles: { [key: string]: CSSProperties } = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 1.5rem",
    background: "linear-gradient(90deg, #d4d4d4ff, #d6d6d6ff)",
    borderRadius: 12,
    margin: "1.25rem auto",
    maxWidth: 1200,
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.47)",
    border: "1px solid rgba(16,24,40,0.04)",
    gap: 12,
    fontFamily:
      "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
  },
  headerTitle: {
    margin: 0,
    fontSize: 20,
    color: "#0f172a",
    letterSpacing: "-0.2px",
    fontWeight: 700,
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    color: "#475569",
    fontSize: 14,
  },
  logoutButton: {
    padding: "8px 12px",
    background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
    color: "white",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    boxShadow: "0 8px 18px rgba(99,102,241,0.14)",
    transition: "transform 140ms ease, box-shadow 140ms ease, opacity 140ms ease",
  },
  main: {
    padding: "2rem",
    maxWidth: 1200,
    margin: "0 auto 3rem",
    background: "transparent",
    fontFamily:
      "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
  },
};

export default DashboardLayout;