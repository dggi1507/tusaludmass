import User from '../models/user.js';
import bcrypt from 'bcrypt'; 

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

    // Validación básica de campos requeridos
    if (!first_name || !email || !password) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    try {
        // Encriptamos la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Asignamos el ID según lo definido: Paciente (2) o Cuidador (3)
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