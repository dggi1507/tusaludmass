import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>TUSALUD+</Text>
          </View>
        </View>

        <Text style={styles.welcomeTitle}>Bienvenido a TuSalud+</Text>
        <Text style={styles.welcomeSubtitle}>Tu bienestar, nuestra prioridad.</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.loginBtn} 
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.loginBtnText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.registerBtn} 
            onPress={() => router.push('/auth/register')}
          >
            <Text style={styles.registerBtnText}>Crear Cuenta</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  logoContainer: { marginBottom: 40 },
  logoPlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#3498DB', justifyContent: 'center', alignItems: 'center' },
  logoText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
  welcomeTitle: { fontSize: 24, fontWeight: 'bold', color: '#2C3E50', marginBottom: 10 },
  welcomeSubtitle: { fontSize: 16, color: '#7F8C8D', marginBottom: 50 },
  buttonContainer: { width: '100%' },
  loginBtn: { backgroundColor: '#3498DB', padding: 16, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  loginBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  registerBtn: { backgroundColor: '#FFF', padding: 16, borderRadius: 10, alignItems: 'center', borderWidth: 2, borderColor: '#3498DB' },
  registerBtnText: { color: '#3498DB', fontWeight: 'bold', fontSize: 16 },
});