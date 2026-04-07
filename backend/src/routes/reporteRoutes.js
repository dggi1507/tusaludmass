import { Router } from 'express';
import { createReporte, getAllReportes, updateReporteEstado } from '../controllers/reporteController.js';

const router = Router();

router.post('/', createReporte);
router.get('/', getAllReportes);
router.patch('/:id/estado', updateReporteEstado);

export default router;
