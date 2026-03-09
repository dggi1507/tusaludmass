import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getPatientDashboard, Appointment, Alarm } from '../../services/patientService';

// Formatear fecha para mostrar
const formatearFecha = (fechaStr: string) => {
  const d = new Date(fechaStr);
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return `${dias[d.getDay()]}, ${d.getDate()} ${d.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}`;
};

const formatearHora = (fechaStr: string) => {
  return new Date(fechaStr).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

// Definimos que el componente recibe 'user' como prop directamente
export default function PacienteScreen({ user }: any) {
  const [citas, setCitas] = React.useState<Appointment[]>([]);
  const [alarmas, setAlarmas] = React.useState<Alarm[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [alarmaFlash, setAlarmaFlash] = React.useState<Alarm | null>(null);

  const cargarDatos = React.useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      const data = await getPatientDashboard(user.id);
      if (data) {
        setCitas(data.appointments);
        setAlarmas(data.alarms);
        // Alarma activa: hora ya pasó o es ahora
        const ahora = new Date();
        const proxima = data.alarms.find((a) => new Date(a.alarm_datetime) <= ahora && a.state === 1);
        setAlarmaFlash(proxima || null);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  React.useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 30000); // Refresco cada 30 segundos
    return () => clearInterval(interval);
  }, [cargarDatos]);

  // Medicamentos = alarmas con patient_medicine_id (hora de toma)
  const medicamentos = alarmas.filter((a) => a.patient_medicine_id != null);

  // Estado para saber qué pantalla mostrar: 'inicio' o 'citas'
  const [vistaActual, setVistaActual] = React.useState('inicio');
  
  // Si por alguna razón 'user' no llega, usamos valores por defecto para evitar errores
  const displayUser = {
    fullName: user?.fullName || 'Paciente Invitado',
    link_code: user?.link_code || '----'
  };



  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Encabezado Azul Curvo */}
      <View style={styles.blueHeader}>
        <Text style={styles.headerTitle}>TUSALUD+</Text>
        
        <View style={styles.userSection}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/100' }} 
            style={styles.avatar} 
          />
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>Buenos Días</Text>
            {/* Mostramos el nombre que viene del login */}
            <Text style={styles.userName}>{displayUser.fullName}</Text>
          </View>
          <View style={styles.codeContainer}>
            <Text style={styles.codeLabel}>Tu código:</Text>
            {/* Mostramos el link_code de la base de datos */}
            <Text style={styles.codeValue}>{displayUser.link_code}</Text>
          </View>
        </View>
      </View>


      {/* --- BLOQUE CENTRAL ÚNICO --- */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498DB" />
          <Text style={styles.loadingText}>Cargando tus datos...</Text>
        </View>
      ) : vistaActual === 'inicio' ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>IMPORTANTES</Text>

          {alarmaFlash && (
            <View style={[styles.card, styles.flashCard]}>
              <Ionicons name="notifications" size={24} color="#FFF" />
              <View style={styles.flashContent}>
                <Text style={styles.cardDoctor}>Recordatorio activo</Text>
                <Text style={styles.cardSub}>{alarmaFlash.title}</Text>
              </View>
            </View>
          )}

          {citas.length > 0 && (
            <>
              <Text style={styles.subsectionTitle}>Citas programadas</Text>
              {citas.slice(0, 3).map((cita) => (
                <View key={cita.id} style={[styles.card, { backgroundColor: '#3498DB' }]}>
                  <Text style={styles.cardDoctor}>Cita médica</Text>
                  <Text style={styles.cardSub}>{cita.description}</Text>
                  <View style={styles.badge}>
                    <Ionicons name="calendar" size={14} color="#FFF" />
                    <Text style={styles.badgeText}>{formatearFecha(cita.appointment_datetime)} • {formatearHora(cita.appointment_datetime)}</Text>
                  </View>
                </View>
              ))}
            </>
          )}

          {medicamentos.length > 0 && (
            <>
              <Text style={styles.subsectionTitle}>Medicamentos</Text>
              {medicamentos.slice(0, 5).map((med) => (
                <View key={med.id} style={[styles.card, { backgroundColor: '#9B51E0' }]}>
                  <Text style={styles.cardDoctor}>{med.title}</Text>
                  <Text style={styles.cardSub}>Hora de toma</Text>
                  <View style={styles.badge}>
                    <Ionicons name="time" size={14} color="#FFF" />
                    <Text style={styles.badgeText}>{formatearHora(med.alarm_datetime)}</Text>
                  </View>
                </View>
              ))}
            </>
          )}

          {citas.length === 0 && medicamentos.length === 0 && !alarmaFlash && (
            <Text style={styles.emptyText}>No hay citas ni medicamentos asignados por el cuidador.</Text>
          )}
        </ScrollView>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>MIS CITAS ASIGNADAS</Text>

          {citas.length > 0 ? (
            citas.map((cita) => (
              <View key={cita.id} style={[styles.card, { backgroundColor: '#3498DB' }]}>
                <Text style={styles.cardDoctor}>Cita médica</Text>
                <Text style={styles.cardSub}>{cita.description}</Text>
                <View style={styles.badge}>
                  <Ionicons name="calendar" size={14} color="#FFF" />
                  <Text style={styles.badgeText}>{formatearFecha(cita.appointment_datetime)} • {formatearHora(cita.appointment_datetime)}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No hay citas programadas por el cuidador.</Text>
          )}
        </ScrollView>
      )}
      {/* --- FIN LÓGICA --- */}
      



 {/* 4. Barra de Navegación Inferior (ESTE ES EL NUEVO BLOQUE) */}
      <View style={styles.tabBar}>
        
        {/* BOTÓN INICIO */}
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => setVistaActual('inicio')}
        >
          <Ionicons 
            name="home" 
            size={24} 
            color={vistaActual === 'inicio' ? "#3498DB" : "#999"} 
          />
          <Text style={[styles.tabText, vistaActual === 'inicio' && { color: '#3498DB' }]}>
            Inicio
          </Text>
        </TouchableOpacity>

        {/* BOTÓN CITAS */}
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => setVistaActual('citas')}
        >
          <Ionicons 
            name={vistaActual === 'citas' ? "calendar" : "calendar-outline"} 
            size={24} 
            color={vistaActual === 'citas' ? "#3498DB" : "#999"} 
          />
          <Text style={[styles.tabText, vistaActual === 'citas' && { color: '#3498DB' }]}>
            Citas
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  blueHeader: {
    backgroundColor: '#3498DB',
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 25 },
  userSection: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#DDD' },
  userInfo: { flex: 1, marginLeft: 15 },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  userName: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  codeContainer: { alignItems: 'center' },
  codeLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  codeValue: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  
  content: { flex: 1, padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 12, color: '#666', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  subsectionTitle: { fontSize: 16, fontWeight: '600', color: '#555', marginTop: 20, marginBottom: 10 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 20, fontSize: 15 },
  flashCard: { backgroundColor: '#E74C3C', flexDirection: 'row', alignItems: 'center', gap: 12 },
  flashContent: { flex: 1 },
  
  filterRow: { flexDirection: 'row', marginBottom: 20 },
  chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F0F0F0', marginRight: 10 },
  activeChip: { backgroundColor: '#3498DB' },
  chipText: { color: '#999', fontWeight: 'bold' },
  activeChipText: { color: '#FFF', fontWeight: 'bold' },

  card: { padding: 20, borderRadius: 20, marginBottom: 15 },
  cardDoctor: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  cardSub: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginBottom: 15 },
  badgeContainer: { flexDirection: 'row', gap: 10 },
  badge: { backgroundColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  badgeText: { color: '#FFF', marginLeft: 5, fontSize: 12, fontWeight: 'bold' },

  tabBar: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#EEE', paddingVertical: 10 },
  tabItem: { flex: 1, alignItems: 'center' },
  tabText: { fontSize: 12, marginTop: 4, color: '#999' }
});