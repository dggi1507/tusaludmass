import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  Linking, 
  Alert, 
  Modal 
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'; 
import * as Location from 'expo-location'; 
import { API_BASE_URL } from '../../config/api';
import { listPatientAlarmas, omitirAlarma, editarAlarma, eliminarAlarma } from '../../services/dataService';
import type { CuidadorUser, PatientLinked, NotificacionEmergente } from '../../types/database';

// --- FUNCIONES DE APOYO ---
function localDateString(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function todayString(): string {
  return localDateString(new Date());
}

function alarmToLocalDateString(alarm_datetime: string): string {
  if (!alarm_datetime) return '';
  return localDateString(new Date(alarm_datetime.replace(' ', 'T')));
}

function formatAlarmTime(alarm_datetime: string): string {
  try {
    const d = new Date(alarm_datetime.replace(' ', 'T'));
    return d.toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit' });
  } catch {
    return alarm_datetime;
  }
}

function getDisplayName(user: { first_name?: string | null; last_name?: string | null; fullName?: string; username?: string }): string {
  if (user.fullName) return user.fullName;
  const name = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
  return name || user.username || '';
}

function generateWeekDays(weekOffset: number) {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() + (weekOffset * 7));
  const todayStr = todayString();
  const dayLabels = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const fullDate = localDateString(d);
    return { 
      num: d.getDate().toString(), 
      label: dayLabels[i], 
      isToday: fullDate === todayStr, 
      fullDate 
    };
  });
}

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export interface CuidadorScreenProps {
  user: CuidadorUser;
  patient?: PatientLinked | null;
}

export default function CuidadorScreen({ user, patient = null }: CuidadorScreenProps) {
  const userName = getDisplayName(user);
  const [pacienteInfo, setPacienteInfo] = useState<any>(null);
  const [loadingMap, setLoadingMap] = useState(true);
  const [todasLasAlarmas, setTodasLasAlarmas] = useState<NotificacionEmergente[]>([]);
  const [loadingAlarmas, setLoadingAlarmas] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(todayString());
  const [menuNotif, setMenuNotif] = useState<NotificacionEmergente | null>(null);
  const [alarmEditando, setAlarmEditando] = useState<NotificacionEmergente | null>(null);
  const [showEditPicker, setShowEditPicker] = useState(false);

  const weekDays = generateWeekDays(weekOffset);
  const alarmasDia = todasLasAlarmas.filter(n => alarmToLocalDateString(n.alarm_datetime) === selectedDate);
  const isPastAlarm = menuNotif ? new Date(menuNotif.alarm_datetime.replace(' ', 'T')) < new Date() : false;
  const esFechaHoy = selectedDate === todayString();

  const firstDayOfWeek = new Date();
  firstDayOfWeek.setDate(firstDayOfWeek.getDate() - firstDayOfWeek.getDay() + weekOffset * 7);
  const weekMonthLabel = MONTH_NAMES[firstDayOfWeek.getMonth()] + (weekOffset !== 0 ? ` ${firstDayOfWeek.getFullYear()}` : '');

  const fetchLocation = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/patients/location/${user.id}`);
      const data = await res.json();
      if (data.success && data.data) setPacienteInfo(data.data);
    } catch (e) {
      console.error('Error obteniendo ubicación:', e);
    } finally {
      setLoadingMap(false);
    }
  };

  const fetchAlarmasReales = async () => {
    const pId = patient?.id || pacienteInfo?.id;
    if (!pId) { setLoadingAlarmas(false); return; }
    try {
      setLoadingAlarmas(true);
      const res = await listPatientAlarmas(pId);
      if (res.success && Array.isArray(res.alarmas)) {
        setTodasLasAlarmas(res.alarmas.filter((a: any) => a.alarm_datetime).map((a: any) => ({
          id: a.id,
          type: 'toma',
          title: a.title,
          detail: 'Medicamento programado',
          alarm_datetime: a.alarm_datetime,
          patient_medicine_id: a.patient_medicine_id,
          state: a.state ?? 1,
        })));
      }
    } catch (e) {
      console.error('Error al cargar alarmas:', e);
    } finally {
      setLoadingAlarmas(false);
    }
  };

  const handleOmitir = async (alarma: NotificacionEmergente) => {
    try {
      const res = await omitirAlarma(alarma.id);
      if (res.success) {
        Alert.alert("Éxito", "Toma omitida correctamente");
        fetchAlarmasReales();
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo omitir");
    } finally {
      setMenuNotif(null);
    }
  };

  useEffect(() => {
    (async () => {
      await Location.requestForegroundPermissionsAsync();
      fetchLocation();
    })();
    const interval = setInterval(fetchLocation, 15000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAlarmasReales();
    }, [patient?.id, pacienteInfo?.id])
  );

  const handleCall = () => {
    const phone = pacienteInfo?.phone || (patient as any)?.phone;
    if (phone) Linking.openURL(`tel:${phone}`);
    else Alert.alert("Error", "No hay teléfono registrado.");
  };

  const currentPatientName = pacienteInfo?.first_name || (patient ? getDisplayName(patient) : 'Paciente');

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
            <View style={styles.avatarPlaceholder}><Ionicons name="person" size={30} color="#666" /></View>
          )}
          <View>
            <Text style={styles.greeting}>Buenos Días</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.calendarNavRow}>
            <TouchableOpacity onPress={() => setWeekOffset(w => w - 1)}><Ionicons name="chevron-back" size={22} /></TouchableOpacity>
            <Text style={styles.monthTitle}>{weekMonthLabel}</Text>
            <TouchableOpacity onPress={() => setWeekOffset(w => w + 1)}><Ionicons name="chevron-forward" size={22} /></TouchableOpacity>
          </View>

          <View style={styles.calendarStrip}>
            {weekDays.map((d) => (
              <TouchableOpacity key={d.fullDate} style={[styles.calendarDay, d.fullDate === selectedDate && styles.calendarDaySelected]} onPress={() => setSelectedDate(d.fullDate)}>
                <Text style={[styles.calendarDayNum, d.fullDate === selectedDate && styles.calendarDayTextActive]}>{d.num}</Text>
                <Text style={[styles.calendarDayLabel, d.fullDate === selectedDate && styles.calendarDayTextActive]}>{d.label}</Text>
                {d.isToday && d.fullDate !== selectedDate && <View style={styles.todayDot} />}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.subSubtitle}>
            {alarmasDia.length} toma(s) {esFechaHoy ? 'hoy' : `el ${selectedDate}`}
          </Text>

          {loadingAlarmas ? (
            <ActivityIndicator color="#004080" />
          ) : alarmasDia.length > 0 ? (
            alarmasDia.map((notif) => (
              <View key={notif.id} style={styles.timelineItem}>
                <View style={[styles.pillIcon, { backgroundColor: '#004080' }]}><FontAwesome5 name="pills" size={14} color="#FFF" /></View>
                <View style={styles.activityInfo}>
                  <View style={styles.activityRow}>
                    <Text style={styles.activityTitle} numberOfLines={1}>{notif.title}</Text>
                    <TouchableOpacity onPress={() => setMenuNotif(notif)}><Ionicons name="ellipsis-vertical" size={18} color="#666" /></TouchableOpacity>
                  </View>
                  <Text style={styles.activityTime}><Ionicons name="time-outline" size={12} /> {formatAlarmTime(notif.alarm_datetime)}</Text>
                </View>
              </View>
            ))
          ) : <Text style={styles.emptyText}>No hay tomas para este día</Text>}
        </View>

        <Text style={styles.sectionLabel}>Ubicación de {currentPatientName}</Text>
        <View style={styles.mapContainer}>
          {loadingMap ? (
            <ActivityIndicator size="large" color="#004080" />
          ) : pacienteInfo?.latitude ? (
            <MapView
              provider={PROVIDER_GOOGLE}
              style={StyleSheet.absoluteFillObject}
              region={{
                latitude: parseFloat(pacienteInfo.latitude),
                longitude: parseFloat(pacienteInfo.longitude),
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
            >
              <Marker coordinate={{ latitude: parseFloat(pacienteInfo.latitude), longitude: parseFloat(pacienteInfo.longitude) }} title={currentPatientName}>
                <View style={styles.markerWrapper}><Ionicons name="person-circle" size={40} color="#004080" /></View>
              </Marker>
            </MapView>
          ) : <Text style={styles.noLocationText}>Buscando señal GPS...</Text>}
          <TouchableOpacity style={styles.locationOverlay} onPress={handleCall}>
            <Ionicons name="call" size={20} color="#004282" />
            <Text style={styles.locationText}>Llamar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={!!menuNotif} transparent animationType="slide">
        <TouchableOpacity style={styles.modalBackdrop} onPress={() => setMenuNotif(null)} />
        <View style={styles.bottomSheet}>
          <View style={styles.bottomSheetHandle} />
          <Text style={styles.bottomSheetTitle} numberOfLines={2}>{menuNotif?.title}</Text>
          <Text style={styles.bottomSheetTime}>{menuNotif ? formatAlarmTime(menuNotif.alarm_datetime) : ''}</Text>

          {!isPastAlarm && (
            <TouchableOpacity style={styles.sheetOption} onPress={() => { setMenuNotif(null); setAlarmEditando(menuNotif); setShowEditPicker(true); }}>
              <Ionicons name="pencil-outline" size={20} color="#004080" />
              <Text style={[styles.sheetOptionText, { color: '#004080' }]}>Editar hora</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.sheetOption} onPress={() => handleOmitir(menuNotif!)}>
            <Ionicons name="close-circle-outline" size={20} color="#FF9800" />
            <Text style={[styles.sheetOptionText, { color: '#FF9800' }]}>Omitir toma</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sheetOption} onPress={() => setMenuNotif(null)}>
            <Text style={styles.sheetCancelText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { backgroundColor: '#004080', paddingHorizontal: 20, paddingVertical: 15, alignItems: 'flex-start' },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', letterSpacing: 2 },
  scrollContent: { padding: 20 },
  welcomeSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, marginRight: 15, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
  greeting: { fontSize: 14, color: '#666' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  summaryCard: { backgroundColor: '#F8F9FA', borderRadius: 15, padding: 20, elevation: 2 },
  calendarNavRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  monthTitle: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  calendarStrip: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  calendarDay: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 6, borderRadius: 10, minWidth: 36 },
  calendarDaySelected: { backgroundColor: '#004080' },
  calendarDayNum: { fontSize: 14, color: '#999' },
  calendarDayLabel: { fontSize: 11, color: '#999' },
  calendarDayTextActive: { color: '#FFF', fontWeight: 'bold' },
  todayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#004080', marginTop: 3 },
  subSubtitle: { fontSize: 12, color: '#999', textAlign: 'center', marginBottom: 20 },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  pillIcon: { width: 28, height: 28, borderRadius: 14, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  activityInfo: { flex: 1, backgroundColor: '#FFF', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#EEE' },
  activityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  activityTitle: { fontWeight: 'bold', fontSize: 14, flex: 1, marginRight: 8 },
  activityTime: { fontSize: 12, color: '#004080', marginTop: 4 },
  emptyText: { textAlign: 'center', color: '#999', fontSize: 12 },
  sectionLabel: { fontSize: 16, fontWeight: 'bold', marginTop: 25, marginBottom: 10 },
  mapContainer: { height: 250, borderRadius: 15, backgroundColor: '#E0E0E0', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  locationOverlay: { position: 'absolute', bottom: 10, left: 10, backgroundColor: '#FFF', padding: 10, borderRadius: 20, flexDirection: 'row', alignItems: 'center', elevation: 3 },
  locationText: { marginLeft: 8, fontWeight: 'bold', color: '#004282' },
  markerWrapper: { backgroundColor: 'white', borderRadius: 20, padding: 2, elevation: 5 },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  bottomSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 34 },
  bottomSheetHandle: { width: 40, height: 4, backgroundColor: '#DDD', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  bottomSheetTitle: { fontWeight: 'bold', fontSize: 15, color: '#333', marginBottom: 4 },
  bottomSheetTime: { color: '#004080', fontSize: 13, marginBottom: 16 },
  sheetOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderTopWidth: 1, borderColor: '#F0F0F0' },
  sheetOptionText: { fontSize: 15, marginLeft: 12, fontWeight: '500' },
  sheetCancelText: { textAlign: 'center', color: '#666', fontSize: 15, fontWeight: '500', width: '100%' },
  noLocationText: { textAlign: 'center', color: '#999' }
});