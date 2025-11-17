import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api'; // Nuestra instancia de Axios

// --- Definición de Tipos ---
interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'RECEPCIONISTA' | 'MEDICO';
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  role: User['role'] | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  loading: boolean;
}

interface AuthProviderProps {
  children: ReactNode; // Permite cualquier nodo React como hijo
}

// --- Creación del Contexto ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Hook para usar el Contexto ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// --- Proveedor del Contexto ---
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [role, setRole] = useState<User['role'] | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Para saber si ya comprobó el token

  // Efecto para verificar si hay un token en localStorage al cargar la app
  useEffect(() => {
    const checkUser = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        const parsedUser: User = JSON.parse(userData);
        setUser(parsedUser);
        setRole(parsedUser.role);
        setIsAuthenticated(true);
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  // Función de Login
  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    setUser(userData);
    setRole(userData.role);
    setIsAuthenticated(true);
  };

  // Función de Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    user,
    role,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};