import express from "express";
import cors from "cors"; 
import authRoutes from './routes/authRoutes.js';
import dataRoutes from './routes/dataRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import alarmRoutes from './routes/alarmRoutes.js';
import medicineRoutes from './routes/medicineRoutes.js';
import externalRoutes from './routes/externalRoutes.js';
import reporteRoutes from './routes/reporteRoutes.js';

const app = express();

// Middlewares
// CORS configurado para aceptar peticiones de Netlify y la App móvil
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); 

app.use(express.json()); 

// Rutas de la API
app.use('/api', authRoutes);
app.use('/api', dataRoutes);
app.use('/api/patients', patientRoutes); // Simplificado a una sola ruta
app.use('/api/appointments', appointmentRoutes);
app.use('/api/alarms', alarmRoutes);
app.use('/api/medicines', medicineRoutes); // Simplificado a una sola ruta
app.use('/api/external', externalRoutes);
app.use('/api/reportes', reporteRoutes);

// Ruta de prueba para verificar salud del servidor
app.get('/api/saludo', (req, res) => {
  res.json({ mensaje: "Conexión exitosa desde el Backend de Node.js en Render" });
});

// Ruta base para evitar errores 404 en el navegador
app.get('/', (req, res) => {
  res.send("Servidor de TuSalud Mas activo y listo.");
});

// Manejo global de errores - Siempre devuelve JSON
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Error interno del servidor: ' + err.message 
  });
});

export default app;
