import React, { useState, useEffect, type CSSProperties } from 'react';
import api from '../services/api';

// --- Definición de Tipos ---
// Tipo para el rol
type UserRole = 'ADMIN' | 'RECEPCIONISTA' | 'MEDICO';

// Interfaz para el usuario (como lo recibimos del backend)
interface User {
  _id: string; // MongoDB usa _id
  username: string;
  role: UserRole;
}

// --- Componente ---
const PanelAdmin = () => {
  // --- Estados ---
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'MEDICO' as UserRole, // Rol por defecto en el formulario
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // --- Efecto para cargar usuarios al montar ---
  useEffect(() => {
    fetchUsers();
  }, []);

  // --- Función para Cargar Usuarios ---
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get<User[]>('/users');
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar usuarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Manejador de cambios en el formulario ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Manejador para Crear Usuario ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      // Llamada a la API para crear usuario
      const response = await api.post<User>('/users', formData);
      
      // Añadir el nuevo usuario a la lista local (sin recargar)
      setUsers([...users, response.data]);
      
      setMessage('Usuario creado con éxito');
      
      // Limpiar formulario
      setFormData({ username: '', password: '', role: 'MEDICO' });
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al crear usuario';
      setError(errorMsg);
      console.error(err);
    }
  };

  // ---- Funcion para cambiar rol de usuario ---
  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      //llamamos al nuevo endpoint
      await api.put(`/users/${userId}`, { role: newRole });

      // Actualizamos la lista localmente
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole as UserRole } : u));

      alert('Rol Actualizado con éxito');
    } catch (error) {
      alert('Error al actualizar el rol');
      console.error(error);
    }
  };

  // --- Renderizado ---
  if (loading) {
    return <div>Cargando usuarios...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Sección 1: Crear Usuario */}
      <div style={styles.formContainer}>
        <h2 style={styles.heading}>Crear Nuevo Usuario</h2>
        
        {/* Mensajes de feedback */}
        {error && <p style={styles.error}>{error}</p>}
        {message && <p style={styles.message}>{message}</p>}

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nombre de Usuario:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Rol:</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="MEDICO">Médico</option>
              <option value="RECEPCIONISTA">Recepcionista</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
          <button type="submit" style={styles.button}>Crear Usuario</button>
        </form>
      </div>

      {/* Sección 2: Listado de Usuarios */}
      <div style={styles.listContainer}>
        <h2 style={styles.heading}>Usuarios del Sistema</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nombre de Usuario</th>
              <th style={styles.th}>Rol</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td style={styles.td}>{user.username}</td>
                <td style={styles.td}>
                  <select
                    value={user.role}
                    onChange={(e) => handleChangeRole(user._id, e.target.value)}
                    style={styles.select}
                  >
                    <option value="MEDICO">Médico</option>
                    <option value="RECEPCIONISTA">Recepcionista</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Objeto de Estilos ---
const styles: { [key: string]: CSSProperties } = {
  container: {
    display: "flex",
    gap: "2rem",
    maxWidth: 1200,
    margin: "2.5rem auto",
    fontFamily:
      "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
  },
  formContainer: {
    flex: 1,
    padding: "1.5rem",
    borderRadius: 12,
    background: "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(250,250,255,0.95))",
    boxShadow: "0 10px 30px rgba(15,23,42,0.06), inset 0 1px 0 rgba(255,255,255,0.6)",
    border: "1px solid rgba(16,24,40,0.04)",
  },
  listContainer: {
    flex: 2,
    padding: "1.25rem",
    borderRadius: 12,
    background: "linear-gradient(180deg, #ffffff, #fbfbff)",
    boxShadow: "0 8px 20px rgba(15,23,42,0.04)",
    border: "1px solid rgba(16,24,40,0.04)",
  },
  heading: {
    borderBottom: "2px solid rgba(99,102,241,0.18)",
    paddingBottom: "0.5rem",
    marginBottom: "1.25rem",
    color: "#0f172a",
    fontSize: 18,
    fontWeight: 700,
  },
  error: {
    color: "#7f1d1d",
    backgroundColor: "#ffefef",
    border: "1px solid #fca5a5",
    padding: "10px 12px",
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 13,
  },
  message: {
    color: "#064e3b",
    backgroundColor: "#ecfdf5",
    border: "1px solid #bbf7d0",
    padding: "10px 12px",
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 13,
  },
  inputGroup: {
    marginBottom: "14px",
  },
  label: {
    display: "block",
    marginBottom: 6,
    fontSize: 13,
    color: "#0f172a",
    fontWeight: 600,
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid rgba(15,23,42,0.08)",
    background: "linear-gradient(180deg, #fff, #fbfbff)",
    outline: "none",
    boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
    fontSize: 14,
    transition: "box-shadow 160ms ease, border-color 160ms ease, transform 160ms ease",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid rgba(15,23,42,0.08)",
    background: "white",
    fontSize: 14,
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
    color: "white",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: "0.2px",
    boxShadow: "0 8px 20px rgba(99,102,241,0.18)",
    transition: "transform 140ms ease, box-shadow 140ms ease, opacity 140ms ease",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14,
    color: "#0f172a",
  },
  th: {
    border: "1px solid rgba(15,23,42,0.06)",
    padding: "10px 12px",
    backgroundColor: "#f8fafc",
    textAlign: "left",
    fontWeight: 700,
  },
  td: {
    border: "1px solid rgba(15,23,42,0.04)",
    padding: "10px 12px",
    verticalAlign: "middle",
  },
};


export default PanelAdmin;