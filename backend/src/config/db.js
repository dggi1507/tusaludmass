import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

// Usamos la URI completa que es más segura y fácil para Aiven/Render
const db = mysql.createConnection(process.env.DATABASE_URL + "?ssl-mode=REQUIRED");

db.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos de Aiven:', err.message);
    return;
  }
  console.log('¡Conexión exitosa a la base de datos en la nube!');
});

export default db;
