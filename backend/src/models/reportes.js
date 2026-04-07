import db from '../config/db.js';

const Reportes = {
  create: (caregiverId, titulo, descripcion, categoria, callback) => {
    const sql = `
      INSERT INTO reportes (caregiver_id, titulo, descripcion, categoria)
      VALUES (?, ?, ?, ?)
    `;
    db.query(sql, [caregiverId, titulo, descripcion, categoria || 'general'], callback);
  },

  getAll: (callback) => {
    const sql = `
      SELECT
        r.id, r.caregiver_id, r.titulo, r.descripcion,
        r.categoria, r.estado, r.created_at,
        u.first_name, u.last_name, u.username, u.email
      FROM reportes r
      JOIN users u ON u.id = r.caregiver_id
      ORDER BY r.created_at DESC
    `;
    db.query(sql, callback);
  },

  updateEstado: (id, estado, callback) => {
    const sql = `UPDATE reportes SET estado = ? WHERE id = ?`;
    db.query(sql, [estado, id], callback);
  },
};

export default Reportes;
