// 1. Esta es tu nueva URL de producción
export const API_BASE_URL = 'https://tusaludmas.onrender.com/api';

// 2. Mantenemos el export default por si algún archivo lo usa así
const API_URL = API_BASE_URL;
export default API_URL;

// 3. Agregamos los endpoints que trajo Sofía para que su código no falle
export const ENDPOINTS = {
    register: `${API_BASE_URL}/register`
}
