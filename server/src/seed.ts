import mongoose from 'mongoose';
import User from './models/user.model';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const users = [
  {
    username: 'admin',
    password: 'password123',
    role: 'ADMIN',
  },
  {
    username: 'recepcion',
    password: 'password123',
    role: 'RECEPCIONISTA',
  },
  {
    username: 'dr.house', 
    password: 'password123',
    role: 'MEDICO',
  },
];

const seedDB = async () => {
  const MONGO_URI = process.env.MONGO_URI as string;

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a MongoDB para el seeding...');

    // Limpiar la colección
    await User.deleteMany({});
    console.log('Usuarios existentes eliminados.');

    // Insertar los nuevos usuarios
    // .create() disparará el hook 'pre-save' para hashear las contraseñas
    await User.create(users);
    console.log('Usuarios de prueba creados exitosamente.');

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error durante el seeding:', error.message);
    } else {
      console.error('Error desconocido durante el seeding.');
    }
  } finally {
    // Cerrar la conexión
    await mongoose.connection.close();
    console.log('Conexión de MongoDB cerrada.');
  }
};

// Ejecutar el script
seedDB();