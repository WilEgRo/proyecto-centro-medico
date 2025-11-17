import { Request, Response } from 'express';
import User from '../models/user.model';

// --- Crear un nuevo usuario (Rol: ADMIN) ---
export const createUser = async (req: Request, res: Response) => {
  const { username, password, role } = req.body;

  // Validación básica
  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Todos los campos son requeridos (username, password, role)' });
  }

  try {
    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
    }

    // Crear el usuario
    // El 'pre-save' hook en 'userModel' se encargará de hashear el password
    const user = await User.create({
      username,
      password,
      role,
    });

    // Devolver el usuario creado (sin el password)
    res.status(201).json({
      id: user._id,
      username: user.username,
      role: user.role,
    });

  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Error al crear el usuario', error: error.message });
    } else {
      res.status(500).json({ message: 'Error desconocido' });
    }
  }
};

// --- Listar todos los usuarios (Rol: ADMIN) ---
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Usamos .select('-password') para excluir explícitamente el campo password
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
    } else {
      res.status(500).json({ message: 'Error desconocido' });
    }
  }
};

// --- Listar solo usuarios con rol de MÉDICO ---
export const getMedicos = async (req: Request, res: Response) => {
  try {
    const medicos = await User.find({ role: 'MEDICO' }).select('-password');
    res.json(medicos);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Error al obtener los médicos', error: error.message });
    } else {
      res.status(500).json({ message: 'Error desconocido' });
    }
  }
};

// ---- actualizar usuario (solo admin, para cambiar rol) ----
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role, username } = req.body;

  try {
    // buscar y actualizar
    const user = await User.findByIdAndUpdate(
      id,
      { role, username },
      { new: true } // para devolver el documento actualizado
    ).select('-password'); // excluir password

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user);

  } catch (error) {
    // .... manejo de errores estandar ....
    res.status(500).json({ message: 'Error al actualizar el usuario', error: error instanceof Error ? error.message : 'Error desconocido' });
  }

};