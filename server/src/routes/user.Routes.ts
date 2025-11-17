import { Router } from 'express';
import { createUser, getAllUsers, getMedicos } from '../controllers/user.Controller';
import { checkAuth } from '../middlewares/checkAuth';
import { checkRole } from '../middlewares/checkRole';

const router = Router();

// Ambas rutas estan protegidas por checkAuth y restringidas solo para ADMIN
router.post(
    '/',
    checkAuth,
    checkRole(['ADMIN']),
    createUser
);

router.get(
    '/',
    checkAuth,
    checkRole(['ADMIN']),
    getAllUsers
);

// Ruta para que recepcionistas vean la lista de médicos
router.get(
  '/medicos',
  checkAuth,
  checkRole(['RECEPCIONISTA', 'ADMIN']),
  getMedicos
);

export default router;