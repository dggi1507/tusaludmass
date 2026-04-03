/**
 * Configuración central del API backend.
 * Ya no usamos la IP local, ahora apuntamos al servidor en la nube de Render.
 */

// 1. Esta es tu nueva URL de producción
export const API_BASE_URL = 'https://tusaludmas.onrender.com/api';

// 2. Mantenemos el export default por si algún archivo lo usa así
const API_URL = API_BASE_URL;
export default API_URL;