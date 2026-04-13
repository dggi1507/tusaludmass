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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middlewares
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); 

app.use(express.json()); 

// 1. RUTAS DE LA API (Estas no dan error porque son rutas fijas)
app.use('/api', authRoutes);
app.use('/api', dataRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/alarms', alarmRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/catalog', medicineRoutes);
app.use('/api/external', externalRoutes);
app.use('/api/reportes', reporteRoutes);

// 2. RUTA DE PRUEBA
app.get('/api/saludo', (req, res) => {
  res.json({ mensaje: "Servidor operativo" });
});

// 3. SERVIR ARCHIVOS ESTÁTICOS
app.use(express.static(path.join(__dirname, '../dist')));

// 4. --- SOLUCIÓN FINAL SIN REGEX ---
// En lugar de usar '', '(.)' o ':any(.*)', usamos un middleware simple.
// Si la petición llega hasta aquí y NO es una ruta de API, entregamos el index.html.
app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  } else {
    next();
  }
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Error interno' });
});

export default app;
