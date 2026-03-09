import express from 'express';
const router = express.Router();
import { createAppointment, deleteAppointment, getAppointmentsByPatient } from '../controllers/appointmentController.js';
router.post('/', createAppointment);
router.delete('/:id', deleteAppointment);

export default router;

router.get('/paciente/:id', getAppointmentsByPatient); // Esta es la nueva dirección
