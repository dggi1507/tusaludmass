import express from 'express';
const router = express.Router();
import { createAlarm, updateAlarmState, getAlarmsByPatient } from '../controllers/alarmController.js';

router.post('/', createAlarm);
router.put('/:id', updateAlarmState);

export default router;

// otros imports
router.get('/paciente/:id', getAlarmsByPatient); 