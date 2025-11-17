import { useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const LoginPage = () => {
  // ----- Hooks -----
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { login } = useAuth(); //Obtenemos la funcion login del contexto de autenticación

  // ----- manejador del envio del formulario -----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // evita que la pagina se recargue al enviar el formulario
    setError(null); // limpia errores previos

    try {
      // llamar a la api del backend (server)
      const response = await api.post("/auth/login", {
        username,
        password,
      });

      // Extraer los datos de la respuesta
      const { token, user} = response.data;

      // Guardar la sesión en el contexto
      login(token, user);

      // Redirigir al dashboard
      // nuesta ruta protegida esta en '/*', asi que '/' funciona
      navigate("/");

    } catch (err: any) {
      // Manejar el error
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Error al iniciar sesion. Por favor, intente nuevamente.");
      }
    }
  };
  // ----- Renderizado del componente -----
  return (
    <div style={styles.container}>
      <h2>Iniciar Sesión</h2>
      
      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={styles.inputGroup}>
          <label htmlFor="username" style={styles.label}>Usuario:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label htmlFor="password" style={styles.label}>Contraseña:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <button type="submit" style={styles.button}>
          Entrar
        </button>
      </form>
    </div>
  );
};

// --- Objeto de Estilos ---
// Usamos React.CSSProperties para el tipado.
const styles: { [key: string]: CSSProperties } = {
  container: {
    maxWidth: '400px',
    margin: '100px auto',
    padding: '2rem',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  error: {
    color: 'red',
    backgroundColor: '#ffebeB',
    border: '1px solid red',
    padding: '10px',
    borderRadius: '4px',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: '1.2rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 500,
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box', // Importante para que el padding no rompa el width
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
    fontWeight: 600,
  }
};

export default LoginPage;