import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

//esta interfaz define la estructura del payload de nuestro JWT
interface DecodedPayload {
    id: string;
    role: string;
}

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            //obtener el token sin el prefijo 'Bearer '
            token = req.headers.authorization.split(' ')[1];

            //verificar el token}
            const secret = process.env.JWT_SECRET as string;
            const decoded = jwt.verify(token!, secret) as unknown as DecodedPayload;

            // adjuntar el payload al req.user
            // Si la propiedad 'user' no está en la definición de Request, hacemos un cast para evitar el error de compilación
            // Forzamos a TypeScript a aceptar la propiedad 'user'
            (req as Request & { user: DecodedPayload }).user = {
                id: decoded.id,
                role: decoded.role,
            };
            next();
        } catch (error) {
            res.status(401).json({ message: 'No autorizado, token inválido' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'No autorizado, token no proporcionado' });
    }
}