import User from '../models/user.js';
import bcrypt from 'bcrypt'; 
import sgMail from '@sendgrid/mail'; //
import crypto from 'crypto';

// Configuramos SendGrid con la API Key que pusiste en Render
sgMail.setApiKey(process.env.SENDGRID_API_KEY); //

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
        
        res.json({ 
            success: true, 
            users: safeUsers 
        });
    });
};

// REGISTRO DE USUARIO
export const register = async (req, res) => {
    const { first_name, last_name, email, password, roleType } = req.body;

    if (!first_name || !email || !password) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const roles_id = (roleType === 'cuidador') ? 3 : 2;

        User.create({ 
            first_name, 
            last_name, 
            email, 
            password: hashedPassword,
            roles_id 
        }, (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: "El correo o usuario ya existe" });
                }
                console.error("Error al crear:", err);
                return res.status(500).json({ message: "Error al registrar en la base de datos" });
            }
            
            res.status(201).json({ 
                success: true,
                message: `Usuario ${roleType || 'paciente'} registrado con éxito`,
                userId: result.insertId 
            });
        });
    } catch (error) {
        console.error("Error en el catch:", error);
        res.status(500).json({ message: "Error en el servidor", details: error.message });
    }
};

// ACTUALIZAR USUARIO
export const updateUser = (req, res) => {
    const { id } = req.params; 
    const userData = req.body;

    User.update(id, userData, (err, result) => {
        if (err) {
            console.error('Error al actualizar:', err);
            return res.status(500).json({ success: false, message: 'Error al actualizar datos' });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        res.json({ success: true, message: 'Datos actualizados correctamente' });
    });
};

// RECUPERAR CONTRASEÑA (ENVÍO CON SENDGRID)
export const forgotPassword = (req, res) => {
    const { email } = req.body;

    User.findByEmail(email, async (err, user) => {
        if (err) return res.status(500).json({ success: false, message: 'Error de servidor' });
        if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

        // Generamos un código de 6 números
        const token = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresDate = new Date(Date.now() + 3600000); // 1 hora
        const expires = expiresDate.toISOString().slice(0, 19).replace('T', ' '); 

        User.saveResetToken(user.id, token, expires, async (err) => {
            if (err) {
                console.error("Error al guardar token:", err);
                return res.status(500).json({ success: false, message: 'Error al procesar la solicitud' });
            }

            // Configuramos el mensaje para SendGrid
            const msg = {
                to: user.email, //
                from: 'giraldogiraldodaniel3@gmail.com', // El correo que verificaste en SendGrid
                subject: 'Código de Recuperación - Tu Salud +',
                html: `
                    <div style="font-family: sans-serif; max-width: 450px; border: 1px solid #eee; padding: 25px; border-radius: 8px;">
                        <h2 style="color: #2c3e50; text-align: center;">Recuperación de Cuenta</h2>
                        <p>Hola, <strong>${user.first_name || 'Usuario'}</strong>.</p>
                        <p>Has solicitado restablecer tu contraseña. Usa el siguiente código para completar el proceso:</p>
                        <div style="background: #f9f9f9; padding: 15px; text-align: center; font-size: 1.8em; font-weight: bold; color: #4A90E2; border: 2px dashed #4A90E2; margin: 20px 0; letter-spacing: 5px;">
                            ${token}
                        </div>
                        <p style="font-size: 0.85em; color: #7f8c8d;">Este código es válido por 1 hora.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="text-align: center; color: #bdc3c7; font-size: 0.8em;">&copy; 2026 Tu Salud + | Medellín, Colombia</p>
                    </div>
                `,
            };

            try {
                await sgMail.send(msg); //
                console.log("Correo enviado exitosamente con SendGrid"); //
                res.status(200).json({ success: true, message: 'Correo enviado con éxito' });
            } catch (sendError) {
                console.error("Error de SendGrid:", sendError.response?.body || sendError); //
                res.status(500).json({ success: false, message: 'Error al enviar el correo' });
            }
        });
    });
};

// RESTABLECER CONTRASEÑA FINAL
export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ success: false, message: 'Token y nueva contraseña requeridos' });
    }

    User.findByResetToken(token, async (err, user) => {
        if (err || !user) {
            return res.status(400).json({ 
                success: false, 
                message: 'El código es inválido o ya expiró. Pide uno nuevo.' 
            });
        }

        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            User.updatePassword(user.id, hashedPassword, (err) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Error al actualizar la contraseña' });
                }
                res.json({ success: true, message: '¡Contraseña actualizada con éxito!' });
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error en el servidor al encriptar' });
        }
    });
};