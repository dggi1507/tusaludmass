import db from '../config/db.js';

export const createAppointment = (req, res) => {
    // Extraemos los datos según tus columnas: users_id, location_id, appointment_datetime, description, status
    const { users_id, location_id, appointment_datetime, description } = req.body;
    
    // El 'status' lo podemos poner como 'pendiente' o 1 por defecto
    const sql = `INSERT INTO appointments (users_id, location_id, appointment_datetime, description, status) 
                 VALUES (?, ?, ?, ?, 'programada')`;
    
    db.query(sql, [users_id, location_id || null, appointment_datetime, description], (err, result) => {
        if (err) {
            console.error("Error en DB Citas:", err);
            return res.status(500).json({ success: false, error: err });
        }
        res.json({ success: true, message: "Cita creada con éxito", id: result.insertId });
    });
};

export const deleteAppointment = (req, res) => {
    const { id } = req.params;
    db.query(`DELETE FROM appointments WHERE id = ?`, [id], (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, message: "Cita eliminada" });
    });
};

import Patient from '../models/patientModel.js';

export const getAppointmentsByPatient = (req, res) => {
    const { id } = req.params; // Recibe el ID del paciente desde la URL
    Patient.getAppointments(id, (err, results) => {
        if (err) return res.status(500).json({ success: false, error: err });
        res.json(results); // Envía las citas al celular
    });
};