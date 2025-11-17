import { Request, Response } from "express";
import Appointment, {IAppointment} from "../models/appointment.Model";

interface RequestWithUser extends Request {
  user?: {
    id: string;
    role: string;
  }
}

// --- Crear un nuevo turno (Rol: RECEPCIONISTA) ---
export const createAppointment = async (req: Request, res: Response) => {
  const { paciente, medico, fecha, hora, motivo } = req.body;

  try {
    const newAppointment = await Appointment.create({
      paciente,
      medico,
      fecha,
      hora,
      motivo,
      estado: 'PROGRAMADO', // Estado inicial
    });
    res.status(201).json(newAppointment);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Error al crear el turno', error: error.message });
    } else {
      res.status(500).json({ message: 'Error desconocido al crear el turno', error});
    }
  }
};

// ---- Listar turnos (con filtros) ----
export const getAppointments = async (req: Request, res: Response) => {
  const { medicoId, estado } = req.query; // Filtros por query params
  
  // Construimos el objeto de filtro para Mongoose
  const filter: any = {};
  if (medicoId) filter.medico = medicoId;
  if (estado) filter.estado = estado;

  // --- RESTRICCIÓN DE ROL ---
  // Si el rol es MEDICO, *solo* puede ver sus propios turnos.
  const user = (req as RequestWithUser).user;
  if (user?.role === 'MEDICO') {
    filter.medico = user.id;
  }

  try {
    // .populate() reemplaza los IDs con la info real del paciente y del médico
    const appointments = await Appointment.find(filter)
      .populate('paciente', 'nombreCompleto CI') // Trae solo nombre y CI del paciente
      .populate('medico', 'username'); // Trae solo el username del médico

    res.json(appointments);
  } catch (error) {
     if (error instanceof Error) {
      res.status(500).json({ message: 'Error al obtener los turnos', error: error.message });
    } else {
      res.status(500).json({ message: 'Error desconocido' });
    }
  }
};

// --- Actualizar estado de un turno ---
export const updateAppointmentStatus = async (req: Request, res: Response) => {
  const { id } = req.params; // ID del turno
  const { estado } = req.body; // Nuevo estado: ATENDIDO, CANCELADO, AUSENTE
  const { role, id: userId } = (req as RequestWithUser).user!; // Datos del usuario logueado
  
  try {
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Turno no encontrado' });
    }

    // --- LÓGICA DE AUTORIZACIÓN POR ROL ---

    // Lógica para MÉDICO
    if (role === 'MEDICO') {
      // Un médico solo puede modificar SUS PROPIOS turnos
      if (appointment.medico.toString() !== userId) {
        return res.status(403).json({ message: 'No tiene permiso para modificar este turno' });
      }
      // Y solo puede cambiar a ATENDIDO o AUSENTE
      if (estado !== 'ATENDIDO' && estado !== 'AUSENTE') {
        return res.status(400).json({ message: 'Un médico solo puede marcar como ATENDIDO o AUSENTE' });
      }
    }

    // Lógica para RECEPCIONISTA
    if (role === 'RECEPCIONISTA') {
      // Un recepcionista puede cancelar turnos (o cambiar otros estados si quisiéramos)
      if (estado !== 'CANCELADO') {
         return res.status(400).json({ message: 'El recepcionista solo puede CANCELAR turnos' });
      }
    }
    
    // (ADMIN puede hacer todo, así que no necesita lógica especial si checkRole le da acceso)

    // Actualizar el estado
    appointment.estado = estado as IAppointment['estado'];
    await appointment.save();

    res.json(appointment);

  } catch (error) {
     if (error instanceof Error) {
      res.status(500).json({ message: 'Error al actualizar el turno', error: error.message });
    } else {
      res.status(500).json({ message: 'Error desconocido' });
    }
  }
};

// --- Modificar Turno Completo (Recepcionista) ---
export const updateAppointment = async (req: Request, res: Response) => {
  const { id } = req.params;
  // Extraemos todo lo que se puede cambiar
  const { fecha, hora, motivo, medico, estado } = req.body; 

  try {
    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ message: 'Turno no encontrado' });

    // Solo Recepcionista puede usar esta ruta completa
    // (Aunque el middleware checkRole ya nos protege, validamos lógica)
    
    // Actualizamos los campos si vienen en el body
    if (fecha) appointment.fecha = fecha;
    if (hora) appointment.hora = hora;
    if (motivo) appointment.motivo = motivo;
    if (medico) appointment.medico = medico;
    if (estado) appointment.estado = estado; // Aquí enviarán 'CANCELADO'

    await appointment.save();
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error al modificar el turno' });
  }
};