import { useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const LoginPage = () => {
  // ----- Hooks -----
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth(); //Obtenemos la funcion login del contexto de autenticación

  // ----- manejador del envio del formulario -----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // evita que la pagina se recargue al enviar el formulario
    if (isSubmitting) return; // evita envíos múltiples
    setError(null); // limpia errores previos
    setIsSubmitting(true);

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
    } finally {
      setIsSubmitting(false);
    }
  };
  // ----- Renderizado del componente -----
  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Iniciar Sesión</h2>
      <p style={styles.subtitle}>Accede a tu cuenta</p>

      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={styles.inputGroup}>
          <label htmlFor="username" style={styles.label}>Usuario</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={styles.input}
            onFocus={(e) => (e.currentTarget.style.boxShadow = styles.inputFocus!.boxShadow as string)}
            onBlur={(e) => (e.currentTarget.style.boxShadow = styles.input!.boxShadow as string)}
          />
        </div>

        <div style={styles.inputGroup}>
          <label htmlFor="password" style={styles.label}>Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
            onFocus={(e) => (e.currentTarget.style.border = styles.inputFocus!.border as string)}
            onBlur={(e) => (e.currentTarget.style.border = styles.input!.border as string)}
          />
        </div>
        <button
          type="submit"
          style={{
            ...styles.button,
            ...(isSubmitting ? styles.buttonDisabled : {})
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Ingresando..." : "Login"}
        </button>
      </form>
    </div>
  );
};
// --- Objeto de Estilos ---
// Usamos React.CSSProperties para el tipado.
const styles: { [key: string]: CSSProperties } = {
  container: {
    maxWidth: 420,
    margin: "6rem auto",
    padding: "2.25rem",
    background: "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(250,250,255,0.95))",
    borderRadius: 16,
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255,255,255,0.6)",
    border: "1px solid rgba(16,24,40,0.06)",
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
  },
  header: {
    margin: 0,
    marginBottom: 12,
    fontSize: 22,
    color: "#0f172a",
    letterSpacing: "-0.2px",
  },
  subtitle: {
    margin: 0,
    marginBottom: 18,
    fontSize: 13,
    color: "#475569",
  },
  error: {
    color: "#7f1d1d",
    backgroundColor: "#ffefef",
    border: "1px solid #fca5a5",
    padding: "10px 12px",
    borderRadius: 8,
    textAlign: "center",
    marginBottom: 14,
    fontSize: 13,
  },
  inputGroup: {
    marginBottom: 14,
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
  },
  inputFocus: {
    border: "1px solid #6366f1",
    boxShadow: "0 6px 18px rgba(99,102,241,0.12)",
  },
  helperRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    fontSize: 13,
    color: "#64748b",
  },
  button: {
    width: "100%",
    padding: "12px 14px",
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
  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
    transform: "none",
    boxShadow: "none",
  },
  smallLink: {
    color: "#4f46e5",
    textDecoration: "none",
    fontWeight: 600,
  }
};

export default LoginPage;