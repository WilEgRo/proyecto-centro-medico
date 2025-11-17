import mongoose from 'mongoose';
import User from './models/user.model';
import Patient from './models/patient.model';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const users = [
  {
    username: 'admin',
    password: 'admin',
    role: 'ADMIN',
  },
  {
    username: 'recepcion',
    password: 'admin',
    role: 'RECEPCIONISTA',
  },
  {
    username: 'dr.house', 
    password: 'admin',
    role: 'MEDICO',
  },
];

const patients = [
  { nombreCompleto: "Juan Pérez", CI: "10001", fechaNacimiento: new Date("1985-05-15T12:00:00"), telefono: "70010001" },
  { nombreCompleto: "María Rodríguez", CI: "10002", fechaNacimiento: new Date("1990-08-20T12:00:00"), telefono: "70010002" },
  { nombreCompleto: "Carlos Gómez", CI: "10003", fechaNacimiento: new Date("1978-02-10T12:00:00"), telefono: "70010003" },
  { nombreCompleto: "Ana Fernández", CI: "10004", fechaNacimiento: new Date("1995-11-30T12:00:00"), telefono: "70010004" },
  { nombreCompleto: "Luis Martínez", CI: "10005", fechaNacimiento: new Date("1982-07-25T12:00:00"), telefono: "70010005" },
  { nombreCompleto: "Laura López", CI: "10006", fechaNacimiento: new Date("2000-01-15T12:00:00"), telefono: "70010006" },
  { nombreCompleto: "Pedro Sánchez", CI: "10007", fechaNacimiento: new Date("1965-09-05T12:00:00"), telefono: "70010007" },
  { nombreCompleto: "Sofía Díaz", CI: "10008", fechaNacimiento: new Date("1988-03-22T12:00:00"), telefono: "70010008" },
  { nombreCompleto: "Jorge Torres", CI: "10009", fechaNacimiento: new Date("1975-12-12T12:00:00"), telefono: "70010009" },
  { nombreCompleto: "Elena Ruiz", CI: "10010", fechaNacimiento: new Date("1992-06-18T12:00:00"), telefono: "70010010" },
  { nombreCompleto: "Miguel Ángel Castro", CI: "10011", fechaNacimiento: new Date("1980-04-01T12:00:00"), telefono: "70010011" },
  { nombreCompleto: "Patricia Morales", CI: "10012", fechaNacimiento: new Date("1998-10-10T12:00:00"), telefono: "70010012" },
  { nombreCompleto: "Fernando Ortiz", CI: "10013", fechaNacimiento: new Date("1970-05-05T12:00:00"), telefono: "70010013" },
  { nombreCompleto: "Gabriela Herrera", CI: "10014", fechaNacimiento: new Date("1985-08-08T12:00:00"), telefono: "70010014" },
  { nombreCompleto: "Ricardo Vargas", CI: "10015", fechaNacimiento: new Date("1993-02-28T12:00:00"), telefono: "70010015" },
  { nombreCompleto: "Carmen Castillo", CI: "10016", fechaNacimiento: new Date("1960-11-11T12:00:00"), telefono: "70010016" },
  { nombreCompleto: "Roberto Mendoza", CI: "10017", fechaNacimiento: new Date("1987-07-07T12:00:00"), telefono: "70010017" },
  { nombreCompleto: "Isabel Romero", CI: "10018", fechaNacimiento: new Date("1991-09-19T12:00:00"), telefono: "70010018" },
  { nombreCompleto: "Daniel Silva", CI: "10019", fechaNacimiento: new Date("1983-03-03T12:00:00"), telefono: "70010019" },
  { nombreCompleto: "Verónica Rojas", CI: "10020", fechaNacimiento: new Date("1996-06-06T12:00:00"), telefono: "70010020" }
];

const seedDB = async () => {
  const MONGO_URI = process.env.MONGO_URI as string;

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a MongoDB para el seeding...');

    // Limpiar la colección
    await User.deleteMany({});
    console.log('Usuarios antiguos eliminados.');
    // Insertar los nuevos usuarios
    // .create() disparará el hook 'pre-save' para hashear las contraseñas
    await User.create(users);
    console.log('Usuarios de prueba creados (Admin, Recepcion, Medicos).');

    // Limpiar Pacientes y crear nuevos
    await Patient.deleteMany({});
    console.log('Pacientes antiguos eliminados.');
    await Patient.create(patients);
    console.log(`${patients.length} Pacientes de prueba creados.`);

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