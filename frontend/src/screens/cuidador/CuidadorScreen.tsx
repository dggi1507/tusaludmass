import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Linking, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'; 
import * as Location from 'expo-location'; 
import { API_BASE_URL } from '../../config/api';
import type { CuidadorUser, PatientLinked, NotificacionEmergente } from '../../types/database';

// --- FUNCIONES DE APOYO ---
function formatAlarmTime(alarm_datetime: string): string {
  try {
    const d = new Date(alarm_datetime);
    return d.toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit' });
  } catch {
    return alarm_datetime;
  }
}

function getDisplayName(user: { first_name?: string | null; last_name?: string | null; fullName?: string; username?: string }): string {
  if (user.fullName) return user.fullName;
  const first = user.first_name ?? '';
  const last = user.last_name ?? '';
  const name = `${first} ${last}`.trim();
  return name || user.username || '';
}

function generateCalendarDays() {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const days = [];
  const dayLabels = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    days.push({
      num: date.getDate().toString(),
      label: dayLabels[i],
      isToday: date.toDateString() === today.toDateString(),
    });
  }
  return days;
}

const DIAS_CALENDARIO = generateCalendarDays();
const NOTIFICACIONES_EJEMPLO: NotificacionEmergente[] = [
  { id: 1, type: 'toma', title: 'Toma', detail: 'Medicamento', alarm_datetime: new Date().toISOString(), patient_medicine_id: 1 },
];

export interface CuidadorScreenProps {
  user: CuidadorUser;
  patient?: PatientLinked | null;
  notificaciones?: NotificacionEmergente[];
}

export default function CuidadorScreen({
  user,
  patient = null,
  notificaciones = NOTIFICACIONES_EJEMPLO,
}: CuidadorScreenProps) {

  const userName = getDisplayName(user);
  const [pacienteInfo, setPacienteInfo] = useState<any>(null);
  const [loadingMap, setLoadingMap] = useState(true);

  // AJUSTE 1: Estado para forzar el re-renderizado del mapa una vez cargado
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (pacienteInfo) {
      console.log("📍 Datos recibidos en el mapa:", {
        lat: pacienteInfo.latitude,
        lng: pacienteInfo.longitude,
        tipo_lat: typeof pacienteInfo.latitude
      });
    }
  }, [pacienteInfo]);

  const fetchLocation = async () => {
    try {
      const url = `${API_BASE_URL}/patients/location/${user.roles_id}`;
      const response = await fetch(url);
      const result = await response.json();

      if (result.success && result.data) {
        setPacienteInfo(result.data);
      }
    } catch (error) {
      console.error("Error obteniendo ubicación:", error);
    } finally {
      setLoadingMap(false);
    }
  };

  useEffect(() => {
    const prepararPantalla = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permiso denegado');
      }
      fetchLocation();
    };

    prepararPantalla();
    const interval = setInterval(fetchLocation, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleCall = () => {
    const phone = pacienteInfo?.phone || (patient as any)?.phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const currentPatientName = pacienteInfo?.first_name || (patient ? getDisplayName(patient) : 'Paciente');

  // AJUSTE 2: Validación más estricta para asegurar que pasamos NÚMEROS al mapa
  const lat = parseFloat(pacienteInfo?.latitude);
  const lng = parseFloat(pacienteInfo?.longitude);
  const hasValidLocation = !isNaN(lat) && !isNaN(lng) && lat !== 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TUSALUD+</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.welcomeSection}>
          {user.profile_picture ? (
            <Image source={{ uri: user.profile_picture }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={30} color="#666" />
            </View>
          )}
          <View>
            <Text style={styles.greeting}>Buenos Días</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
        </View>

        {/* ... (Sección de calendario y notificaciones se mantiene igual) ... */}
        <View style={styles.summaryCard}>
          <Text style={styles.monthTitle}>Abril</Text>
          <View style={styles.calendarStrip}>
            {DIAS_CALENDARIO.map((d) => (
              <View key={d.num} style={[styles.calendarDay, d.isToday && styles.calendarDayActive]}>
                <Text style={[styles.calendarDayNum, d.isToday && styles.calendarDayTextActive]}>{d.num}</Text>
                <Text style={[styles.calendarDayLabel, d.isToday && styles.calendarDayTextActive]}>{d.label}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.subSubtitle}>
            {notificaciones.filter((n) => n.type === 'toma').length} toma(s) hoy
          </Text>
          {notificaciones.map((notif) => (
            <View key={notif.id} style={styles.timelineItem}>
              <View style={[styles.pillIcon, { backgroundColor: '#2196F3' }]}>
                {notif.type === 'toma' ? <FontAwesome5 name="pills" size={14} color="#FFF" /> : <Ionicons name="calendar" size={14} color="#FFF" />}
              </View>
              <View style={styles.activityInfo}>
                <View style={styles.activityRow}>
                  <Text style={styles.activityTitle}>{notif.title}</Text>
                  <TouchableOpacity><Ionicons name="ellipsis-vertical" size={18} color="#666" /></TouchableOpacity>
                </View>
                {notif.detail && <Text style={styles.activityDetail}>{notif.detail}</Text>}
                <Text style={styles.activityTime}>
                  <Ionicons name="time-outline" size={14} /> {formatAlarmTime(notif.alarm_datetime)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Ubicación de {currentPatientName}</Text>

        <View style={styles.mapContainer}>
          {loadingMap ? (
            <ActivityIndicator size="large" color="#2196F3" />
          ) : hasValidLocation ? (
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              onMapReady={() => setMapReady(true)} // AJUSTE 3: Disparar cuando el motor esté listo
              initialRegion={{
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              region={{
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
            >
              <Marker
                coordinate={{ latitude: lat, longitude: lng }}
                title={currentPatientName}
              >
                <View style={styles.markerWrapper}>
                  <Ionicons name="person-circle" size={40} color="#2196F3" />
                </View>
              </Marker>
            </MapView>
          ) : (
            <View style={styles.noLocationContainer}>
              <Ionicons name="location-outline" size={40} color="#999" />
              <Text style={styles.noLocationText}>Buscando coordenadas...</Text>
            </View>
          )}

          <TouchableOpacity style={styles.locationOverlay} onPress={handleCall}>
            <Ionicons name="call" size={20} color="#004282" />
            <Text style={styles.locationText}>Llamar a {currentPatientName}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { backgroundColor: '#2196F3', paddingHorizontal: 20, paddingVertical: 15 },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', letterSpacing: 2 },
  scrollContent: { padding: 20 },
  welcomeSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, marginRight: 15, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
  greeting: { fontSize: 14, color: '#666' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  summaryCard: { backgroundColor: '#F8F9FA', borderRadius: 15, padding: 20, elevation: 2 },
  monthTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
  calendarStrip: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  calendarDay: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 6, borderRadius: 10, minWidth: 36 },
  calendarDayActive: { backgroundColor: '#2196F3' },
  calendarDayNum: { fontSize: 14, color: '#999' },
  calendarDayLabel: { fontSize: 11, color: '#999' },
  calendarDayTextActive: { color: '#FFF', fontWeight: 'bold' },
  subSubtitle: { fontSize: 12, color: '#999', textAlign: 'center', marginBottom: 20 },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  pillIcon: { width: 28, height: 28, borderRadius: 14, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  activityInfo: { flex: 1, backgroundColor: '#FFF', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#EEE' },
  activityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  activityTitle: { fontWeight: 'bold', fontSize: 14 },
  activityDetail: { color: '#666', fontSize: 12 },
  activityTime: { fontSize: 12, color: '#2196F3', marginTop: 4 },
  sectionLabel: { fontSize: 16, fontWeight: 'bold', marginTop: 25, marginBottom: 10 },
  mapContainer: { height: 250, borderRadius: 15, backgroundColor: '#E0E0E0', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  map: { width: '100%', height: '100%' }, // Asegura que el mapa use todo el contenedor
  noLocationContainer: { alignItems: 'center', padding: 20 },
  noLocationText: { color: '#666', fontStyle: 'italic', textAlign: 'center', marginTop: 10 },
  locationOverlay: { position: 'absolute', bottom: 10, left: 10, backgroundColor: '#FFF', padding: 10, borderRadius: 20, flexDirection: 'row', alignItems: 'center', elevation: 3, zIndex: 10 },
  locationText: { marginLeft: 8, fontWeight: 'bold', color: '#004282' },
  markerWrapper: { backgroundColor: 'white', borderRadius: 20, padding: 2, elevation: 5 }
});