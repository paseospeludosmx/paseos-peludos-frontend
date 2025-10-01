import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  ActivityIndicator, Alert, StyleSheet, RefreshControl
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config'; // debe ser https://paseos-api-h664.onrender.com/api

const PENDING_STATUSES = ['scheduled', 'assigned', 'arrived', 'in_progress'];

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}

export default function PaseadorHome() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [walks, setWalks] = useState([]);
  const [available, setAvailable] = useState(false); // estado local de disponibilidad
  const [error, setError] = useState(null);

  // Carga usuario guardado
  useEffect(() => {
    (async () => {
      const u = JSON.parse((await SecureStore.getItemAsync('user')) || '{}');
      setUser(u);
    })();
  }, []);

  const fetchAssigned = useCallback(async () => {
    if (!user?._id) return;
    setError(null);
    try {
      const url = `${API_URL}/walks/assigned?walkerId=${user._id}`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      const ct = res.headers.get('content-type') || '';
      const raw = await res.text();
      if (!ct.includes('application/json')) {
        throw new Error(`Respuesta no JSON (${res.status}). URL usada: ${url}`);
      }
      const data = JSON.parse(raw);
      if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);

      setWalks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error cargando paseos:', e?.message);
      setError(e?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { fetchAssigned(); }, [fetchAssigned]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAssigned();
  };

  // Paseos pendientes HOY (no completados ni cancelados)
  const now = new Date();
  const pendientesHoy = walks.filter(w => {
    const start = new Date(w.startTimePlanned);
    const isToday = isSameDay(start, now);
    const pending = PENDING_STATUSES.includes(w.status);
    return isToday && pending;
  });

  const puedePonerDisponible = pendientesHoy.length === 0;

  async function toggleDisponible(next) {
    if (!user?._id) return;
    try {
      const url = `${API_URL}/walkers/${user._id}/availability`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ available: next }),
      });
      const ct = res.headers.get('content-type') || '';
      const raw = await res.text();
      let data; try { data = JSON.parse(raw); } catch {}
      if (!ct.includes('application/json')) throw new Error(`Respuesta no JSON (${res.status})`);
      if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
      setAvailable(!!data?.available);
      Alert.alert('Listo', data?.available ? 'Ahora estás disponible.' : 'Disponibilidad desactivada.');
    } catch (e) {
      console.error('Error cambiando disponibilidad:', e?.message);
      Alert.alert('Error', e?.message || 'No se pudo cambiar disponibilidad');
    }
  }

  const renderItem = ({ item }) => {
    const start = new Date(item.startTimePlanned);
    const end = new Date(item.endTimePlanned);
    const hour = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const statusLabel = {
      scheduled: 'Programado',
      assigned: 'Asignado',
      arrived: 'Llegué',
      in_progress: 'En curso',
      completed: 'Completado',
      canceled: 'Cancelado',
    }[item.status] || item.status;

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{item?.dog?.name || 'Paseo'}</Text>
        <Text style={styles.cardLine}>Hora: {hour}</Text>
        <Text style={styles.cardLine}>Estado: {statusLabel}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Cargando paseos…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis paseos de hoy</Text>

      {error ? (
        <View style={styles.errBox}>
          <Text style={styles.errText}>No se pudieron cargar los paseos.</Text>
          <Text style={styles.errSmall}>{error}</Text>
          <TouchableOpacity style={styles.btnOutline} onPress={onRefresh}>
            <Text style={styles.btnOutlineText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={walks.filter(w => isSameDay(new Date(w.startTimePlanned), now))}
          keyExtractor={(it) => it._id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <Text style={styles.empty}>No tienes paseos hoy.</Text>
          }
        />
      )}

      {/* Botón Disponible: solo se habilita si no hay pendientes hoy */}
      <TouchableOpacity
        style={[
          styles.btnMain,
          puedePonerDisponible ? styles.btnEnabled : styles.btnDisabled,
        ]}
        disabled={!puedePonerDisponible}
        onPress={() => toggleDisponible(!available)}
      >
        <Text style={styles.btnMainText}>
          {available ? 'Dejar de estar disponible' : 'Ponerme disponible'}
        </Text>
      </TouchableOpacity>

      {!puedePonerDisponible && (
        <Text style={styles.hint}>
          El botón se habilita cuando termines todos tus paseos de hoy.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16, paddingBottom: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#ff5f45', marginBottom: 12, textAlign: 'center' },
  card: { backgroundColor: '#fff8f0', padding: 12, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  cardTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  cardLine: { color: '#333' },
  empty: { textAlign: 'center', color: '#777', marginVertical: 16 },
  btnMain: { paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  btnEnabled: { backgroundColor: '#1976d2' },
  btnDisabled: { backgroundColor: '#b0b0b0' },
  btnMainText: { color: '#fff', fontWeight: 'bold' },
  hint: { textAlign: 'center', color: '#777', marginTop: 6 },
  errBox: { backgroundColor: '#ffeeee', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#ffcccc' },
  errText: { fontWeight: 'bold', color: '#cc0000' },
  errSmall: { color: '#a33', marginTop: 4, marginBottom: 8, fontSize: 12 },
  btnOutline: { alignSelf: 'center', borderWidth: 1, borderColor: '#1976d2', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  btnOutlineText: { color: '#1976d2', fontWeight: 'bold' },
});
