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

// --- 1. MIDDLEWARES ---
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); 

app.use(express.json()); 

// --- 2. RUTAS DE LA API ---
// Importante: Deben ir antes de servir los archivos estáticos
app.use('/api', authRoutes);
app.use('/api', dataRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/alarms', alarmRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/catalog', medicineRoutes);
app.use('/api/external', externalRoutes);
app.use('/api/reportes', reporteRoutes);

// Ruta de saludo para pruebas rápidas
app.get('/api/saludo', (req, res) => {
  res.json({ mensaje: "Servidor funcionando correctamente" });
});

// --- 3. SERVIR ARCHIVOS ESTÁTICOS ---
// Esto sirve el CSS, JS e imágenes de tu carpeta 'dist'
app.use(express.static(path.join(__dirname, '../dist')));

// --- 4. MANEJADOR PARA LA PÁGINA WEB (FIX) ---
// Cambiamos '/:any(.*)' por '*' para evitar el PathError
app.get('*', (req, res) => {
    // Si la ruta NO comienza con /api, entregamos el index.html de la web
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    } else {
        // Si alguien pide algo en /api que no existe, enviamos 404 en JSON
        res.status(404).json({ success: false, message: 'Ruta de API no encontrada' });
    }
});

// --- 5. MANEJO GLOBAL DE ERRORES ---
app.use((err, req, res, next) => {
  console.error('Error detectado:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Error interno del servidor: ' + err.message 
  });
});

export default app;
