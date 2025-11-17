import { Router } from 'express';
import { createPatient, getAllPatients } from '../controllers/patient.Controller';
import { checkAuth } from '../middlewares/checkAuth';
import { checkRole } from '../middlewares/checkRole';

const router = Router();

// Todos los usuarios logueados pueden ver pacientes
router.get('/', checkAuth, getAllPatients);

// Solo RECEPCIONISTA y ADMIN pueden crear pacientes
router.post(
  '/', 
  checkAuth, 
  checkRole(['RECEPCIONISTA', 'ADMIN']), 
  createPatient
);

export default router;