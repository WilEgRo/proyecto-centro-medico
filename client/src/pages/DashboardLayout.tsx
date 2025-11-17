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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#333',
    color: 'white',
  },
  headerTitle: {
    margin: 0,
    fontSize: '1.5rem',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  logoutButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#d9534f',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  main: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
};
export default DashboardLayout;