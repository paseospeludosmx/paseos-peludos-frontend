import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://paseos-api-h664.onrender.com/api';

export default function PantallaPaseador({ navigation }) {
  const [walker, setWalker] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);

  // Cargar perfil del paseador autenticado
  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setWalker(data?.walker || null);
      } catch (e) {
        console.error('Error cargando perfil paseador:', e.message);
      }
    })();
  }, []);

  // Cargar solicitudes (paseos pendientes)
  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        const res = await fetch(`${API_URL}/walks?status=pending`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (Array.isArray(data)) setSolicitudes(data);
      } catch (e) {
        console.error('Error cargando solicitudes:', e.message);
      }
    })();
  }, []);

  const aceptarPaseo = async (id) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const res = await fetch(`${API_URL}/walks/${id}/accept`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'No se pudo aceptar el paseo');

      Alert.alert('✅ Paseo aceptado', `Has aceptado el paseo`);
      // refrescar solicitudes
      setSolicitudes((prev) => prev.filter((s) => s._id !== id));
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚶‍♂️ Pantalla de Paseador</Text>

      {walker ? (
        <View style={styles.perfilBox}>
          <FontAwesome5 name="user-check" size={24} color="#1976d2" style={styles.icon} />
          <Text style={styles.info}>Bio: {walker.bio || 'Sin descripción'}</Text>
          <Text style={styles.info}>Zonas: {(walker.zones || []).join(', ') || '-'}</Text>
          <Text style={styles.info}>Tarifa: ${walker.ratePerHour || 0}/hora</Text>
        </View>
      ) : (
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>Cargando perfil...</Text>
      )}

      <Text style={styles.subtitle}>📬 Solicitudes pendientes</Text>

      <FlatList
        data={solicitudes}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.info}>🐶 Perro: {item?.dog?.name || '-'}</Text>
            <Text style={styles.info}>📍 Zona: {item?.zone}</Text>
            <Text style={styles.info}>🕒 Fecha: {new Date(item.date).toLocaleString()}</Text>
            <TouchableOpacity style={styles.button} onPress={() => aceptarPaseo(item._id)}>
              <Text style={styles.buttonText}>✅ Aceptar Paseo</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No hay solicitudes.</Text>}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#1976d2', marginTop: 30 }]}
        onPress={() => navigation.navigate('HistorialPaseos')}
      >
        <Text style={styles.buttonText}>📖 Ver historial de paseos</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.replace('Inicio')}>
        <Text style={styles.logoutText}>🔓 Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff8f0', padding: 30 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1976d2', marginBottom: 20, textAlign: 'center' },
  perfilBox: { marginBottom: 25 },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  icon: { marginBottom: 10, alignSelf: 'center' },
  info: { fontSize: 16, marginVertical: 2 },
  card: { backgroundColor: '#f0f4ff', padding: 20, borderRadius: 12, marginBottom: 10 },
  button: { marginTop: 10, backgroundColor: '#4caf50', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  logoutButton: { marginTop: 40, backgroundColor: '#ff5f45', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
