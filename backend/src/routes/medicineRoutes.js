import express from 'express';
import Medicines from '../models/medicines.js';

const router = express.Router();

// 1. Ruta para listar TODO el catálogo (Se activa con /api/medicines o /api/catalog)
router.get('/', (req, res) => {
  Medicines.listCatalog((err, results) => {
      if (err) {
          console.error("Error SQL en catálogo:", err);
          // Enviamos JSON con success: false para que el front sepa qué pasó
          return res.status(500).json({ success: false, message: "Error al obtener catálogo", details: err });
      }
      
      // Enviamos un objeto con la propiedad 'medicines' para que sea más fácil de leer en el front
      res.json({
          success: true,
          medicines: results || []
      });
  });
});

// 2. Ruta de búsqueda: GET /api/medicines/search?term=...
router.get('/search', (req, res) => {
  const { term } = req.query;
  
  if (!term) {
      return res.json({ success: true, medicines: [] }); 
  }

  Medicines.searchByName(term, (err, results) => {
      if (err) {
          console.error("Error SQL en búsqueda:", err);
          return res.status(500).json({ success: false, error: "Error en la búsqueda" });
      }
      res.json({
          success: true,
          medicines: results || []
      });
  });
});

export default router;