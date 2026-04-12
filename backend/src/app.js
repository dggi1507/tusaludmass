import express from "express";
import cors from "cors"; 
// ESTAS LÍNEAS SON LAS QUE SOLUCIONAN EL ERROR EN RENDER:
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

// Configuración necesaria para usar __dirname en módulos de Node (ESM)
const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

// Middlewares
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); 

app.use(express.json()); 

/**
 * RUTAS DE LA API
 */
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
 * Esto quita el error "Cannot GET /eps"
 */
// 1. Sirve los archivos estáticos desde la carpeta 'dist'
app.use(express.static(path.join(__dirname, '../dist')));

// 2. Ruta de saludo para pruebas
app.get('/api/saludo', (req, res) => {
  res.json({ mensaje: "Conexión exitosa desde el Backend de Node.js en Render" });
});

// 3. Maneja cualquier otra ruta para que Expo Router funcione en la web
app.get('*', (req, res) => {
    // Si la ruta NO empieza por /api, entregamos el index.html de la web
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    }
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err.stack);
  res.status(500).json({ success: false, message: 'Error interno del servidor: ' + err.message });
});

export default app;
