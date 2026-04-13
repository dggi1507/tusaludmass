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

// Definimos la ruta del directorio actual de forma segura
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- MIDDLEWARES ---
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); 

app.use(express.json()); 

// --- 1. RUTAS DE LA API ---
// Es importante que las rutas de la API estén ANTES de servir la web
app.use('/api', authRoutes);
app.use('/api', dataRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/alarms', alarmRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/catalog', medicineRoutes);
app.use('/api/external', externalRoutes);
app.use('/api/reportes', reporteRoutes);

// Ruta de prueba para verificar salud de la API
app.get('/api/saludo', (req, res) => {
  res.json({ mensaje: "Servidor funcionando correctamente" });
});

// --- 2. SERVIR ARCHIVOS ESTÁTICOS ---
// Esto permite que el navegador encuentre los archivos .js y .css de la web
app.use(express.static(path.join(__dirname, '../dist')));

// --- 3. MANEJADOR PARA LA PÁGINA WEB (Catch-all) ---
// Usamos '*' para evitar el error PathError [TypeError]: Unexpected (
app.get('*', (req, res) => {
    // Si la ruta NO comienza con /api, entregamos el index.html de la web
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    } else {
        // Si alguien pide una ruta /api que no existe, devolvemos 404 en JSON
        res.status(404).json({ success: false, message: 'Ruta de API no encontrada' });
    }
});

// --- 4. MANEJO GLOBAL DE ERRORES ---
app.use((err, req, res, next) => {
  console.error('Error en el servidor:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Error interno del servidor: ' + err.message 
  });
});

export default app;
