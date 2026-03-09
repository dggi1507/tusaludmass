import express from 'express';
const router = express.Router();
// Nota: También recuerda poner .js al importar el controlador
import { getAllUsers, login, loginByCode, register, updateUser } from '../controllers/authController.js'; 

router.post('/login', login);
router.post('/login-code', loginByCode);
router.get('/users', getAllUsers);
router.post('/register', register);
router.put('/update/:id', updateUser);

export default router;
