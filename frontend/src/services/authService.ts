// frontend/src/services/authService.ts
import { API_BASE_URL } from '../config/api';

const API_URL = `${API_BASE_URL}/auth`; // Simplificamos para que todas usen /auth

export interface AuthResponse {
    success: boolean;
    message?: string;
    user?: {
        id: number;
        username: string;
        first_name: string;
        last_name: string;
        roles_id: number;
        link_code: string;
    };
}

// LOGIN ESTÁNDAR
export const loginProvider = async (username: string, password: string): Promise<AuthResponse> => {
    console.log("Intentando Login en:", `${API_URL}/login`);
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        if (!response.ok) {
            console.log("Error en Login:", data.message);
            return { success: false, message: data.message || "Credenciales incorrectas" };
        }

        return data;
    } catch (error) {
        console.error("Error de red en loginProvider:", error);
        return { success: false, message: "No se pudo conectar con el servidor. Revisa tu red." };
    }
};

// LOGIN POR CÓDIGO
export const loginByCodeProvider = async (code: string): Promise<AuthResponse> => {
    console.log("Intentando Login por Código en:", `${API_URL}/login-code`);
    try {
        const response = await fetch(`${API_URL}/login-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
        });

        const data = await response.json();
        return { success: response.ok, ...data };
    } catch (error) {
        console.error("Error de red en loginByCodeProvider:", error);
        return { success: false, message: "Error de conexión" };
    }
};

// RECUPERAR CONTRASEÑA
export const forgotPasswordProvider = async (email: string): Promise<{success: boolean, message?: string}> => {
    const targetUrl = `${API_URL}/forgot-password`;
    
    console.log("--- DEBUG FORGOT PASSWORD ---");
    console.log("URL Destino:", targetUrl);
    console.log("Email enviado:", email.trim());

    try {
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim() }),
        });
        
        console.log("Estatus HTTP:", response.status);
        
        const data = await response.json();
        
        if (!response.ok) {
            console.log("Respuesta de error del servidor:", data);
            return { success: false, message: data.message };
        }

        console.log("Respuesta exitosa:", data);
        return { success: true, message: data.message };

    } catch (error) {
        // Si entra aquí, el problema es que el celular no llega al servidor
        console.error("Fallo total de conexión (Network Error):", error);
        return { success: false, message: "Error de conexión con el servidor" };
    }
};