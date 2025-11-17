import { Router } from 'express';
import { createAppointment, getAppointments, updateAppointmentStatus } from '../controllers/appointment.Controller';
import { checkAuth } from '../middlewares/checkAuth';
import { checkRole } from '../middlewares/checkRole';

const router = Router();

// Todos los roles pueden ver turnos (pero el controlador los filtra)
router.get('/', checkAuth, getAppointments);

// Solo RECEPCIONISTA puede crear turnos
router.post(
  '/', 
  checkAuth, 
  checkRole(['RECEPCIONISTA']), 
  createAppointment
);

// Solo MEDICO y RECEPCIONISTA pueden actualizar estados (el controlador define *qué* pueden cambiar)
router.put(
  '/:id/status', 
  checkAuth, 
  checkRole(['MEDICO', 'RECEPCIONISTA']), 
  updateAppointmentStatus
);

export default router;