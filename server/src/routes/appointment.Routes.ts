import { Router } from 'express';
import { createAppointment, getAppointments, updateAppointmentStatus, updateAppointment } from '../controllers/appointment.Controller';
import { checkAuth } from '../middlewares/checkAuth';
import { checkRole } from '../middlewares/checkRole';

const router = Router();

//----------------------------------------
// Rutas GET
//----------------------------------------
// Todos los roles pueden ver turnos (pero el controlador los filtra)
router.get('/', checkAuth, getAppointments);

  
//----------------------------------------
// Rutas POST
//----------------------------------------
// Solo RECEPCIONISTA puede crear turnos
router.post(
  '/', 
  checkAuth, 
  checkRole(['RECEPCIONISTA']), 
  createAppointment
);

//----------------------------------------
// Rutas PUT
//----------------------------------------
// Solo MEDICO y RECEPCIONISTA pueden actualizar estados (el controlador define *qué* pueden cambiar)
router.put(
  '/:id/status', 
  checkAuth, 
  checkRole(['MEDICO', 'RECEPCIONISTA']), 
  updateAppointmentStatus
);

// ruta para quie la recepcionista modifique cualquier dato del turno
router.put(
  '/:id', 
  checkAuth, 
  checkRole(['RECEPCIONISTA']), 
  updateAppointment
); 

export default router;