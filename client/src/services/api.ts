import axios from "axios";

// obteneremos la url base desde el archivo .env
const baseURL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
    }
});

// interceptor de peticion (Request interceptor)
// esto se ejecuta antes de que cada peticion sea enviada
api.interceptors.request.use(
  (config) => {
    // Obtenemos el token de localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      // Si hay token, lo añadimos a la cabecera Authorization
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Manejar errores de la petición
    return Promise.reject(error);
  }
);

export default api;