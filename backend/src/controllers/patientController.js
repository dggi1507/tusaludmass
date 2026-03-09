import Patient from '../models/patientModel.js';
// Daniel: Importamos User para acceder a los métodos de ubicación en la tabla users
import User from '../models/user.js'; 

export const getDashboardData = (req, res) => {
    const { id } = req.params; 

    Patient.getAppointments(id, (err, appointments) => {
        if (err) {
            console.error("Error en citas:", err);
            return res.status(500).json({ success: false, message: "Error al consultar citas" });
        }

        Patient.getAlarms(id, (err, alarms) => {
            if (err) {
                console.error("Error en alarmas:", err);
                return res.status(500).json({ success: false, message: "Error al consultar alarmas" });
            }

            res.json({
                success: true,
                data: {
                    appointments: appointments,
                    alarms: alarms
                }
            });
        });
    });
};

// --- Daniel: Inicio de funciones para ubicación en tiempo real ---

/**
 * Daniel: Actualiza la ubicación física del paciente (latitud y longitud)
 * Se espera que el body contenga: { userId, latitude, longitude }
 */
export const updatePatientLocation = (req, res) => {
    const { userId, latitude, longitude } = req.body;
    
    User.updateLocation(userId, latitude, longitude, (err, result) => {
        if (err) {
            console.error("Daniel - Error al actualizar ubicación:", err);
            return res.status(500).json({ success: false, message: "Error al actualizar ubicación" });
        }
        res.status(200).json({ success: true, message: "Ubicación actualizada correctamente" });
    });
};

/**
 * Daniel: Obtiene la ubicación del paciente asociado a un cuidador específico
 * Se recibe el caregiverId por parámetros de URL
 */
export const getLocationForCaregiver = (req, res) => {
    const { caregiverId } = req.params;

    User.getPatientByCaregiver(caregiverId, (err, results) => {
        if (err) {
            console.error("Daniel - Error al obtener ubicación del paciente:", err);
            return res.status(500).json({ success: false, message: "Error al consultar ubicación" });
        }

        // Daniel: En mysql2 con callbacks, los resultados suelen venir en un array
        const patient = results[0]; 
        
        if (!patient) {
            return res.status(404).json({ success: false, message: "No se encontró un paciente vinculado a este cuidador" });
        }

        res.status(200).json({
            success: true,
            data: patient
        });
    });
};

// --- Daniel: Fin de funciones para ubicación ---