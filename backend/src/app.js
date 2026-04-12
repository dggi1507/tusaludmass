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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middlewares
// Configuración de CORS para permitir conexiones externas (App móvil)
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); 

app.use(express.json()); 

// Rutas
app.use('/api', authRoutes);
app.use('/api', dataRoutes);

app.use('/api', patientRoutes); 
app.use('/api/patients', patientRoutes);

app.use('/api/appointments', appointmentRoutes);
app.use('/api/alarms', alarmRoutes);

app.use('/api/medicines', medicineRoutes);
app.use('/api/catalog', medicineRoutes);

app.use('/api/external', externalRoutes);
app.use('/api/reportes', reporteRoutes);

// --- ESTO ES LO QUE SOLUCIONA EL "CANNOT GET /EPS" ---
// Sirve los archivos de la carpeta 'dist' (donde vive tu página web)
app.use(express.static(path.join(__dirname, '../dist')));

// Maneja cualquier otra ruta para que Expo Router funcione en la web
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Ruta de prueba
app.get('/api/saludo', (req, res) => {
  res.json({ mensaje: "Conexión exitosa desde el Backend de Node.js en Render" });
});
// Manejo global de errores - siempre devuelve JSON
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err.stack);
  res.status(500).json({ success: false, message: 'Error interno del servidor: ' + err.message });
});

export default app;
