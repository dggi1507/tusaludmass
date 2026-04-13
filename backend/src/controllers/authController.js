import User from '../models/user.js';
import bcrypt from 'bcrypt'; 
import sgMail from '@sendgrid/mail';
import crypto from 'crypto';

// Configuramos SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// LOGIN ESTÁNDAR
export const login = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Por favor, ingrese usuario y contraseña.' 
        });
    }

    User.authenticate(username, password, (err, results) => {
        if (err) {
            console.error('Error DB:', err);
            return res.status(500).json({ success: false, message: 'Error de servidor' });
        }

        if (results.length > 0) {
            const user = results[0];
            delete user.password;
            res.json({ success: true, user });
        } else {
            res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
        }
    });
};

// LOGIN POR CÓDIGO
export const loginByCode = (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ success: false, message: 'Ingrese el código' });
    }

    User.findByCode(code, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        if (results.length > 0) {
            res.json({ success: true, user: results[0] });
        } else {
            res.status(401).json({ success: false, message: 'Código no válido' });
        }
    });
};

// LISTAR TODOS LOS USUARIOS
export const getAllUsers = (req, res) => {
    User.findAll((err, results) => {
        if (err) {
            console.error('Error al obtener usuarios:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error al obtener la lista de usuarios' 
            });
        }
        const safeUsers = results.map(({ password, ...user }) => user);
        res.json({ success: true, users: safeUsers });
    });
};

// Generador de códigos
function generateLinkCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

// REGISTRO DE USUARIO
export const register = async (req, res) => {
    const { first_name, last_name, username, email, password, phone, birth_date, roleType } = req.body;

    if (!first_name || !last_name || !username || !email || !password || !phone || !birth_date) {
        return res.status(400).json({ success: false, message: "Faltan campos obligatorios" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const roles_id = (roleType === 'cuidador') ? 3 : 2;
        const link_code = roleType === 'paciente' ? generateLinkCode() : null;

        User.create({
            first_name, last_name, username, email,
            password: hashedPassword, phone, birth_date,
            roles_id, link_code
        }, (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ success: false, message: "El correo o usuario ya existe" });
                }
                return res.status(500).json({ success: false, message: "Error en DB" });
            }
            res.status(201).json({
                success: true,
                message: 'Registrado con éxito',
                userId: result.insertId,
                ...(link_code && { link_code })
            });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error en el servidor" });
    }
};

// ACTUALIZAR USUARIO CON LOGS PARA DEPURACIÓN
export const updateUser = (req, res) => {
    const { id } = req.params;
    const userData = req.body;

    // --- LOGS DE ENTRADA ---
    console.log("=== PETICIÓN DE ACTUALIZACIÓN ===");
    console.log("ID recibido:", id);
    console.log("Datos del Body:", JSON.stringify(userData, null, 2));

    if (!userData || Object.keys(userData).length === 0) {
        console.warn("Advertencia: Se recibió un body vacío");
        return res.status(400).json({ success: false, message: 'No se recibieron datos para actualizar' });
    }

    try {
        User.update(id, userData, (err, result) => {
            if (err) {
                // --- LOG DE ERROR DE DB ---
                console.error('ERROR CRÍTICO EN MODELO (User.update):', err);
                
                // Enviamos el mensaje de error real para saber si es por 'username' o por conexión
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error en la base de datos: ' + err.message 
                });
            }

            if (result.affectedRows === 0) {
                console.warn(`No se encontró el usuario con ID: ${id}`);
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }

            console.log("✅ Usuario actualizado con éxito en la DB");
            res.json({ success: true, message: 'Datos actualizados correctamente' });
        });
    } catch (error) {
        // --- LOG DE ERROR INESPERADO ---
        console.error('ERROR INESPERADO EN CONTROLLER:', error);
        res.status(500).json({ success: false, message: 'Error inesperado: ' + error.message });
    }
};
// RECUPERAR CONTRASEÑA
export const forgotPassword = (req, res) => {
    const { email } = req.body;

    User.findByEmail(email, async (err, user) => {
        if (err || !user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

        const token = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 3600000).toISOString().slice(0, 19).replace('T', ' '); 

        User.saveResetToken(user.id, token, expires, async (err) => {
            if (err) return res.status(500).json({ success: false });

            // --- CAMBIO AQUÍ ---
            const msg = {
                to: user.email,
                from: 'tuSalud+ <soporte@tusaludmas.me>', // Usa tu nuevo dominio autenticado
                subject: 'Recuperación de Contraseña - tuSalud+',
                html: `
                    <div style="font-family: sans-serif; border: 1px solid #ddd; padding: 20px;">
                        <h2>Hola, ${user.first_name || 'usuario'}</h2>
                        <p>Has solicitado restablecer tu contraseña en <strong>tuSalud+</strong>.</p>
                        <p>Tu código de seguridad es:</p>
                        <h1 style="color: #2c3e50; letter-spacing: 5px;">${token}</h1>
                        <p>Este código expirará en 1 hora.</p>
                    </div>
                `
            };

            try {
                await sgMail.send(msg);
                res.status(200).json({ success: true, message: 'Correo enviado' });
            } catch (error) {
                console.error("Error enviando con SendGrid:", error.response ? error.response.body : error);
                res.status(500).json({ success: false, message: 'No se pudo enviar el correo' });
            }
        });
    });
};

// RESTABLECER CONTRASEÑA CORREGIDO
export const resetPassword = async (req, res) => {
    // 1. Recibimos los datos (incluimos email por seguridad si tu modelo lo pide)
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ success: false, message: 'Faltan datos obligatorios' });
    }

    // 2. Buscamos al usuario por el token
    User.findByResetToken(token, async (err, user) => {
        // Si hay error de DB o el usuario no existe (token inválido/expirado)
        if (err) {
            console.error("Error en DB:", err);
            return res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }
        
        if (!user) {
            return res.status(400).json({ success: false, message: 'El código es incorrecto o ha expirado' });
        }

        try {
            // 3. Encriptamos la nueva contraseña
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            // 4. Actualizamos en la DB
            User.updatePassword(user.id, hashedPassword, (err) => {
                if (err) {
                    console.error("Error al actualizar pass:", err);
                    return res.status(500).json({ success: false, message: 'No se pudo actualizar la contraseña' });
                }
                
                // 5. RESPUESTA EXITOSA
                res.json({ success: true, message: '¡Contraseña actualizada con éxito!' });
            });
        } catch (error) {
            console.error("Error en el hash:", error);
            res.status(500).json({ success: false, message: 'Error al procesar la contraseña' });
        }
    });
};

// ACTUALIZAR ESTADO
export const updateUserState = (req, res) => {
    const { id } = req.params;
    const { state } = req.body;

    User.updateState(id, state, (err, result) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, message: 'Estado actualizado' });
    });
};
