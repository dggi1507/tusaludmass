import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Extraemos el email de los parámetros de navegación
  const initialEmail = params.email ? params.email.toString() : '';

  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email || !token || !newPassword) {
      Alert.alert("Campos incompletos", "Por favor, llena todos los datos.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Seguridad", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://tusaludmas.onrender.com/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert("¡Éxito!", "Tu contraseña ha sido actualizada.", [
          { text: "Ir al Login", onPress: () => router.replace('/auth/login') }
        ]);
      } else {
        Alert.alert("Error", data.message || "Código incorrecto o expirado.");
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Nueva Contraseña</Text>
      <Text style={styles.subtitle}>Ingresa el código de 6 dígitos enviado a tu correo y tu nueva clave.</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Correo Electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="ejemplo@correo.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Código de Verificación</Text>
        <TextInput
          style={[styles.input, styles.tokenInput]}
          placeholder="000000"
          value={token}
          onChangeText={setToken}
          keyboardType="number-pad"
          maxLength={6}
        />

        <Text style={styles.label}>Nueva Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Mínimo 6 caracteres"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>ACTUALIZAR CONTRASEÑA</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 25,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#004080',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#004080',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F0F4F8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D1D9E6',
  },
  tokenInput: {
    textAlign: 'center',
    letterSpacing: 8,
    fontSize: 22,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#004080',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});