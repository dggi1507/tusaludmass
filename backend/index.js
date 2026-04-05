import dns from 'node:dns'; // <--- 1. Importamos el módulo DNS
dns.setDefaultResultOrder('ipv4first'); // <--- 2. Forzamos IPv4 globalmente

import dotenv from "dotenv";
import app from "./src/app.js";
import "./src/config/db.js";

dotenv.config();

// Render usa el puerto 10000 por defecto
const PORT = process.env.PORT || 10000; 

// Escuchando en 0.0.0.0 para que Render sea feliz
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});