import express from "express";
import cors from "cors"; 
import path from 'path';
import { fileURLToPath } from 'url';

// Importación de Rutas
import authRoutes from './routes/authRoutes.js';
import dataRoutes from './routes/dataRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import alarmRoutes from './routes/alarmRoutes.js';
import medicineRoutes from './routes/medicineRoutes.js';
import externalRoutes from './routes/externalRoutes.js';
import reporteRoutes from './routes/reporteRoutes.js';

const app = express();

// --- SOLUCIÓN DEFINITIVA PARA EL ERROR DE PATH ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middlewares
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); 

app.use(express.json()); 

// Rutas de la API
app.use('/api', authRoutes);
app.use('/api', dataRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/alarms', alarmRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/catalog', medicineRoutes);
app.use('/api/external', externalRoutes);
app.use('/api/reportes', reporteRoutes);

/**
 * SERVIR FRONTEND WEB
 */
// 1. Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../dist')));

// 2. Ruta de prueba
app.get('/api/saludo', (req, res) => {
  res.json({ mensaje: "Backend funcionando en Render" });
});

// 3. Manejador para la página web (SPA)
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    }
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Error interno' });
});

export default app;
