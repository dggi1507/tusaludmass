import dotenv from "dotenv";
import app from "./src/app.js";
import "./src/config/db.js";

dotenv.config();

// 1. Render usa el puerto 10000 por defecto, pero process.env.PORT lo detectará
const PORT = process.env.PORT || 10000; 

// 2. IMPORTANTE: Agregamos '0.0.0.0' para que Render pueda "mapear" el puerto correctamente
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});