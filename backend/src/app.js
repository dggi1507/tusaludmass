import express from "express";
import cors from "cors"; 
import path from 'path';
import { fileURLToPath } from 'url';

// --- IMPORTACIÓN DE RUTAS ---
import authRoutes from './routes/authRoutes.js';
import dataRoutes from './routes/dataRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import alarmRoutes from './routes/alarmRoutes.js';
import medicineRoutes from './routes/medicineRoutes.js';
import externalRoutes from './routes/externalRoutes.js';
import reporteRoutes from './routes/reporteRoutes.js';

const app = express();

// Configuración de rutas de archivos para ES Modules
const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

/**
 * DEFINICIÓN DE LA RUTA DEL FRONTEND
 * Sube dos niveles desde 'src' para llegar a la raíz del proyecto
 * y luego entra en 'frontend/dist'
 */
const frontendPath = path.resolve(__dirname, '../../frontend/dist');

// Middlewares
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); 

app.use(express.json()); 

// --- RUTAS DE LA API ---
app.use('/api', authRoutes);
app.use('/api', dataRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/alarms', alarmRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/external', externalRoutes);
app.use('/api/reportes', reporteRoutes);

// Ruta de prueba para verificar que el backend responde
app.get('/api/saludo', (req, res) => {
  res.json({ mensaje: "Conexión exitosa con el Backend" });
});

/**
 * SERVIR FRONTEND WEB
 */
// 1. Servir los archivos estáticos (JS, CSS, imágenes) desde la carpeta dist
app.use(express.static(frontendPath));

// 2. Middleware de captura para SPA (Single Page Application)
// Si la ruta no es de la API, entrega el index.html del frontend
app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
      if (err) {
        // Si no encuentra el archivo, es que la carpeta 'dist' no se ha generado
        res.status(404).send("Error: El frontend no ha sido compilado (Falta carpeta dist).");
      }
    });
  } else {
    next();
  }
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error detectado:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Error interno del servidor: ' + err.message 
  });
});

export default app;
