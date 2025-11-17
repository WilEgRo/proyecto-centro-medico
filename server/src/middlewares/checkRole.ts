import { Request, Response, NextFunction } from 'express';
// Importamos la interfaz IUser para usar sus tipos de rol
import { IUser } from '../models/user.model';

// Definimos cómo se ve la request "con usuario"
interface RequestWithUser extends Request {
  user?: {
    id: string;
    role: string;
  }
}

// El argumento es un array de los roles permitidos
export const checkRole = (rolesPermitidos: IUser['role'][]) => {
  
  return (req: Request, res: Response, next: NextFunction) => {
    
    // Le decimos a TS que esta 'req' es de nuestro tipo especial
    const user = (req as RequestWithUser).user;
    // Si req.user no existe (checkAuth falló) o el rol no está en la lista
    if (!user || !rolesPermitidos.includes(user.role as IUser['role'])) {
      // 403 Forbidden: Estás autenticado, pero no tienes permisos
      return res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
    }

    // Si tiene permisos, continúa
    next();
  };
};