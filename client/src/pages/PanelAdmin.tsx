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
    display: 'flex',
    gap: '2rem',
  },
  formContainer: {
    flex: 1,
    padding: '1.5rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
  },
  listContainer: {
    flex: 2,
  },
  heading: {
    borderBottom: '2px solid #007bff',
    paddingBottom: '0.5rem',
    marginBottom: '1.5rem',
  },
  error: {
    color: 'red',
    backgroundColor: '#ffebeB',
    padding: '10px',
    borderRadius: '4px',
  },
  message: {
    color: 'green',
    backgroundColor: '#e6ffec',
    padding: '10px',
    borderRadius: '4px',
  },
  inputGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 500,
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: 'white',
  },
  button: {
    width: '100%',
    padding: '12px',
    background: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    border: '1px solid #ddd',
    padding: '8px',
    backgroundColor: '#f2f2f2',
    textAlign: 'left',
  },
  td: {
    border: '1px solid #ddd',
    padding: '8px',
  },
};

export default PanelAdmin;