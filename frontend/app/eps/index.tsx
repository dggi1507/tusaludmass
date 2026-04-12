import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';

export default function EpsPanel() {
    const [tab, setTab] = useState<'medico' | 'clinica'>('medico');
    const [form, setForm] = useState({ fname: '', lname: '', email: '', pass: '', clinica: '', c_name: '', c_addr: '' });

    const handleAction = async (type: 'doctor' | 'clinic') => {
        const BASE_URL = 'https://tusaludmas.onrender.com/api';
        const endpoint = type === 'doctor' ? 'register-doctor' : 'register-clinic';
        const body = type === 'doctor' 
            ? { first_name: form.fname, last_name: form.lname, email: form.email, password: form.pass, clinica: form.clinica }
            : { name: form.c_name, address: form.c_addr };

        try {
            const res = await fetch(`${BASE_URL}/external/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            alert(data.message);
        } catch (e) {
            alert("Error de conexión con Render");
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.header}>Gestión EPS - TuSalud Mas</Text>
                <View style={styles.tabRow}>
                    <TouchableOpacity onPress={() => setTab('medico')} style={[styles.tab, tab === 'medico' && styles.activeTab]}>
                        <Text style={{color: tab === 'medico' ? 'white' : '#007bff'}}>Médicos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setTab('clinica')} style={[styles.tab, tab === 'clinica' && styles.activeTab]}>
                        <Text style={{color: tab === 'clinica' ? 'white' : '#007bff'}}>Clínicas</Text>
                    </TouchableOpacity>
                </View>

                {tab === 'medico' ? (
                    <View>
                        <TextInput placeholder="Nombres" style={styles.in} onChangeText={t => setForm({...form, fname: t})} />
                        <TextInput placeholder="Apellidos" style={styles.in} onChangeText={t => setForm({...form, lname: t})} />
                        <TextInput placeholder="Correo" style={styles.in} onChangeText={t => setForm({...form, email: t})} />
                        <TextInput placeholder="Password" style={styles.in} secureTextEntry onChangeText={t => setForm({...form, pass: t})} />
                        <TextInput placeholder="Clínica" style={styles.in} onChangeText={t => setForm({...form, clinica: t})} />
                        <TouchableOpacity style={styles.btn} onPress={() => handleAction('doctor')}><Text style={{color:'white'}}>Registrar Médico</Text></TouchableOpacity>
                    </View>
                ) : (
                    <View>
                        <TextInput placeholder="Nombre Clínica" style={styles.in} onChangeText={t => setForm({...form, c_name: t})} />
                        <TextInput placeholder="Dirección" style={styles.in} onChangeText={t => setForm({...form, c_addr: t})} />
                        <TouchableOpacity style={[styles.btn, {backgroundColor: '#28a745'}]} onPress={() => handleAction('clinic')}><Text style={{color:'white'}}>Crear Clínica</Text></TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5', justifyContent: 'center', alignItems: 'center' },
    card: { backgroundColor: 'white', padding: 40, borderRadius: 15, width: 450, elevation: 5 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    tabRow: { flexDirection: 'row', marginBottom: 25, justifyContent: 'center' },
    tab: { paddingVertical: 10, paddingHorizontal: 20, borderWidth: 1, borderColor: '#007bff', borderRadius: 5, marginHorizontal: 5 },
    activeTab: { backgroundColor: '#007bff' },
    in: { borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 15, padding: 8 },
    btn: { backgroundColor: '#007bff', padding: 15, borderRadius: 8, alignItems: 'center' }
});
