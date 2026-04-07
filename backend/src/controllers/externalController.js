import db from '../config/db.js';
import bcrypt from 'bcrypt';

// --- REGISTRO DE CLÍNICA ---
export const registerClinic = (req, res) => {
    const { name, address } = req.body;

    if (!name) return res.status(400).json({ success: false, message: "Nombre de clínica requerido" });

    const sql = `INSERT INTO locations (name, address) VALUES (?, ?)`;
    db.query(sql, [name, address || 'Sin dirección'], (err, result) => {
        if (err) {
            console.error("Error al insertar clínica:", err);
            return res.status(500).json({ success: false, message: "Error DB al crear clínica" });
        }
        res.status(201).json({ success: true, message: "Clínica creada correctamente" });
    });
};

// --- REGISTRO DE MÉDICO ---
export const registerDoctorWithCheck = async (req, res) => {
    const { first_name, last_name, email, password, clinica } = req.body;

    // 1. Validar que la clínica exista (Comparación exacta de nombre)
    const checkSql = `SELECT name FROM locations WHERE name = ? LIMIT 1`;
    
    db.query(checkSql, [clinica], async (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Error de validación en BD" });
        
        if (results.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: `La clínica '${clinica}' no existe. Regístrela primero en la otra pestaña.` 
            });
        }

        try {
            // 2. Preparar datos del médico
            const hashedPassword = await bcrypt.hash(password, 10);
            const username = email.split('@')[0];

            // 3. Insertar en 'users'. 
            // NOTA: Asegúrate que tu tabla tenga estas columnas exactas.
            const sqlUser = `
                INSERT INTO users (username, first_name, last_name, password, email, clinica, roles_id, state) 
                VALUES (?, ?, ?, ?, ?, ?, 4, 1)`;

            db.query(sqlUser, [username, first_name, last_name, hashedPassword, email, clinica], (err2) => {
                if (err2) {
                    // ESTO ES LO QUE DEBES MIRAR EN LA TERMINAL SI FALLA
                    console.error("--- ERROR AL CREAR MÉDICO ---");
                    console.error("Código:", err2.code);
                    console.error("Mensaje:", err2.sqlMessage);
                    return res.status(500).json({ 
                        success: false, 
                        message: "Error al crear médico: " + (err2.sqlMessage || err2.code) 
                    });
                }
                res.status(201).json({ success: true, message: "Médico registrado y vinculado a " + clinica });
            });
        } catch (e) {
            console.error("Error de cifrado:", e);
            res.status(500).json({ success: false, message: "Error interno de servidor" });
        }
    });
};

export const listClinicsAndDoctors = (req, res) => {
    const clinicsSql = `
        SELECT id, name, address
        FROM locations
        ORDER BY name ASC
    `;

    db.query(clinicsSql, (clinicsErr, clinicsResults) => {
        if (clinicsErr) {
            console.error("Error al listar clínicas:", clinicsErr);
            return res.status(500).json({ success: false, message: "Error al obtener clínicas" });
        }

        db.query("SHOW COLUMNS FROM users LIKE 'clinica'", (schemaErr, schemaRows) => {
            if (schemaErr) {
                console.error("Error al validar esquema users:", schemaErr);
                return res.status(500).json({ success: false, message: "Error al validar usuarios" });
            }

            const hasClinicaColumn = Array.isArray(schemaRows) && schemaRows.length > 0;
            const doctorsSql = hasClinicaColumn
                ? `
                    SELECT id, first_name, last_name, email, clinica, state
                    FROM users
                    WHERE roles_id = 4
                    ORDER BY first_name ASC, last_name ASC
                  `
                : `
                    SELECT id, first_name, last_name, email, state
                    FROM users
                    WHERE roles_id = 4
                    ORDER BY first_name ASC, last_name ASC
                  `;

            db.query(doctorsSql, (doctorsErr, doctorsResults) => {
                if (doctorsErr) {
                    console.error("Error al listar médicos:", doctorsErr);
                    return res.status(500).json({ success: false, message: "Error al obtener médicos" });
                }

                return res.json({
                    success: true,
                    clinics: clinicsResults || [],
                    doctors: doctorsResults || [],
                });
            });
        });
    });
};