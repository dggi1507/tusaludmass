import express from 'express';
const router = express.Router();

// Daniel: Se agregaron las funciones faltantes dentro de las llaves { } 
// para que router.put y router.get las reconozcan.
import { 
    getDashboardData, 
    updatePatientLocation, 
    getLocationForCaregiver 
} from '../controllers/patientController.js';

// El frontend llamará a: /api/patient/dashboard/ID_DEL_PACIENTE
router.get('/patient/dashboard/:id', getDashboardData);

// --- Daniel: Inicio de rutas para ubicación en tiempo real ---

/**
 * Daniel: Ruta para que el dispositivo del paciente envíe sus coordenadas GPS.
 * Método: PUT
 * URL: /api/patients/update-location
 */
router.put('/update-location', updatePatientLocation);

/**
 * Daniel: Ruta para que el cuidador obtenga la ubicación actual de su paciente.
 * Método: GET
 * URL: /api/patients/location/:caregiverId
 */
router.get('/location/:caregiverId', getLocationForCaregiver);

// --- Daniel: Fin de rutas para ubicación ---

export default router;