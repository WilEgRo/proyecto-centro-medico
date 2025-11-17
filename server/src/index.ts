import express, { Express, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
// -- importar rutas --
import authRoutes from './routes/auth.Routes';
import patientRoutes from './routes/patient.Routes';
import appointmentRoutes from './routes/appointment.Routes';
import userRoutes from './routes/user.Routes';

// ------- configuración de variables de entorno -------
dotenv.config();

// ------- inicialización -------
const app: Express = express();

// ------- middlewares -------
app.use(cors()); // Middleware para habilitar CORS
app.use(express.json()); // Middleware para parsear JSON

// ------- rutas -------
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users', userRoutes);


// ------- ruta de prueba -------
app.get('/', (req: Request, res: Response) => {
    res.send('API del centro medico universitario funcionando con Typescript');
});

// ------- conexión a la base de datos -------
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI as string; // le decimos a ts que confiamos que MONGO_URI existe

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('conectado a MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error al conectar a MongoDB Atlas:', error.message);
  });

