import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Franja Azul Superior de tu imagen */}
      <View style={styles.blueHeader}>
        <Text style={styles.headerTitle}>TUSALUD+</Text>
      </View>

      <ScrollView contentContainerStyle={styles.formPadding}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
          <Ionicons name="arrow-back" size={24} color="black" />
          <Text style={styles.titleText}>Crear una cuenta</Text>
        </TouchableOpacity>

        <TextInput style={styles.input} placeholder="Nombre" />
        <TextInput style={styles.input} placeholder="Apellidos" />
        <TextInput style={styles.input} placeholder="Correo electrónico" keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Contraseña" secureTextEntry={true} />
        <TextInput style={styles.input} placeholder="Confirmar contraseña" secureTextEntry={true} />

        <TouchableOpacity style={styles.submitBtn}>
          <Text style={styles.submitBtnText}>Crear cuenta</Text>
        </TouchableOpacity>

        <View style={styles.footerInfo}>
          <Text style={styles.legalText}>
            Al registrarte, aceptas nuestras Condiciones, la Política de privacidad.
          </Text>
          <TouchableOpacity style={styles.checkContainer}>
             <Ionicons name="checkbox" size={20} color="#3498DB" />
             <Text style={styles.checkText}>Acepto Políticas de privacidad</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push('/auth/login')}>
          <Text style={styles.loginLink}>¿Ya tienes una cuenta? <Text style={{fontWeight: 'bold', color: '#3498DB'}}>Iniciar sesión</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  blueHeader: { backgroundColor: '#3498DB', padding: 15 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  formPadding: { padding: 25 },
  backRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  titleText: { fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  input: { 
    borderWidth: 1, 
    borderColor: '#CCC', 
    borderRadius: 10, 
    padding: 15, 
    marginBottom: 15,
    fontSize: 16
  },
  submitBtn: { 
    backgroundColor: '#3498DB', 
    padding: 18, 
    borderRadius: 10, 
    alignItems: 'center',
    marginTop: 10 
  },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  footerInfo: { marginTop: 20, alignItems: 'center' },
  legalText: { textAlign: 'center', fontSize: 12, color: '#666' },
  checkContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
  checkText: { marginLeft: 8, color: '#3498DB', fontWeight: '600' },
  loginLink: { textAlign: 'center', marginTop: 30, color: '#666' }
});