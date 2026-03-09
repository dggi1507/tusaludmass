import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getAllUsersProvider, UserData } from '../../src/services/adminService';

export default function UsersScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const response = await getAllUsersProvider();
    if (response.success && response.users) {
      setUsers(response.users);
    } else {
      Alert.alert("Error", response.message || "No se pudo cargar la lista");
    }
    setLoading(false);
  };

  const toggleManage = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderUserItem = ({ item }: { item: UserData }) => {
    // Lógica para evitar el undefined
    const displayName = item.first_name 
      ? `${item.first_name} ${item.last_name || ''}`.trim() 
      : item.username;

    const initials = item.first_name 
      ? `${item.first_name[0]}${item.last_name?.[0] || ''}`.toUpperCase()
      : item.username.substring(0, 2).toUpperCase();

    return (
      <View style={styles.cardContainer}>
        <View style={styles.userCard}>
          <View style={styles.userInfoContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.userName}>{displayName}</Text>
              <Text style={styles.userDate}>{item.email}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.manageBtn, expandedId === item.id && styles.manageBtnActive]} 
            onPress={() => toggleManage(item.id)}
          >
            <Text style={styles.manageBtnText}>Gestionar</Text>
            <Ionicons 
              name={expandedId === item.id ? "chevron-up" : "chevron-down"} 
              size={14} 
              color="white" 
              style={{ marginLeft: 5 }} 
            />
          </TouchableOpacity>
        </View>

        {expandedId === item.id && (
          <View style={styles.expandedMenu}>
            <TouchableOpacity 
              style={styles.menuOption} 
              onPress={() => Alert.alert("Editar", `Editando a ${displayName}`)}
            >
              <Ionicons name="create-outline" size={18} color="#3498DB" />
              <Text style={styles.menuOptionText}>Editar Datos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuOption} 
              onPress={() => Alert.alert("Estado", `ID: ${item.id} - Estado: ${item.state}`)}
            >
              <Ionicons name="ban-outline" size={18} color="#E74C3C" />
              <Text style={[styles.menuOptionText, { color: '#E74C3C' }]}>Suspender</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestionar Usuarios</Text>
        <TouchableOpacity onPress={loadUsers}>
          <Ionicons name="refresh" size={24} color="#3498DB" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3498DB" />
          <Text style={styles.loaderText}>Cargando desde MySQL...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay usuarios registrados.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 20, 
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE'
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 10, color: '#666' },
  listContent: { padding: 15 },
  cardContainer: { 
    backgroundColor: '#FFF', 
    borderRadius: 12, 
    marginBottom: 10, 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 15 
  },
  userInfoContainer: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: { 
    width: 45, 
    height: 45, 
    borderRadius: 22.5, 
    backgroundColor: '#E8F0FE', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarText: { fontWeight: 'bold', color: '#3498DB', fontSize: 16 },
  textContainer: { marginLeft: 12 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#2C3E50' },
  userDate: { fontSize: 12, color: '#7F8C8D', marginTop: 2 },
  manageBtn: { 
    flexDirection: 'row',
    backgroundColor: '#3498DB', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 8,
    alignItems: 'center'
  },
  manageBtnActive: { backgroundColor: '#2874A6' },
  manageBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  expandedMenu: { 
    flexDirection: 'row', 
    borderTopWidth: 1, 
    borderTopColor: '#F0F0F0', 
    backgroundColor: '#FBFCFC',
    padding: 12,
    justifyContent: 'space-around'
  },
  menuOption: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 5 
  },
  menuOptionText: { 
    marginLeft: 8, 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#3498DB' 
  },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' }
});