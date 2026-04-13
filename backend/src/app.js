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
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middlewares
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); 

app.use(express.json()); 

// 1. RUTAS DE LA API
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
  res.json({ mensaje: "Servidor funcionando correctamente" });
});

// 3. SERVIR ARCHIVOS ESTÁTICOS
// Esto sirve el CSS, JS e imágenes de tu carpeta 'dist'
app.use(express.static(path.join(__dirname, '../dist')));

// 4. EL CAMBIO CLAVE: Manejador para la página web
// Cambiamos '' por '(.)' para que sea compatible con la nueva versión
app.get('/:any(.*)', (req, res) => {
    // Si la ruta no empieza por /api, entregamos el index.html de la web
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    }
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

export default app;
