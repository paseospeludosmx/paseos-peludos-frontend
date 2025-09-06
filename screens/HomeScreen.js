import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

// Si ya creaste config.js, usa:
import { API_URL } from '../config';
// Si no, puedes usar temporalmente:
// const API_URL = 'https://paseos-api-h664.onrender.com/api';

export default function PantallaCliente({ navigation }) {
  const [user, setUser] = useState(null);

  // filtros de búsqueda
  const [zone, setZone] = useState('Roma');            // zona inicial
  const [day, setDay] = useState('sat');               // mon|tue|wed|thu|fri|sat|sun

  // resultados
  const [walkers, setWalkers] = useState([]);
  const [best, setBest] = useState(null);
  const [loading, setLoading] = useState(false);

  // carga usuario guardado (para reservas, etc.)
  useEffect(() => {
    (async () => {
      const raw = await SecureStore.getItemAsync('user');
      if (raw) setUser(JSON.parse(raw));
    })();
  }, []);

  // Buscar paseadores en tu API
  const buscarPaseador = async () => {
    try {
      setLoading(true);
      setBest(null);

      const res = await fetch(`${API_URL}/walkers?zone=${encodeURIComponent(zone)}&day=${encodeURIComponent(day)}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setWalkers(list);

      // Compatibilidad muy simple:
      // +20 si incluye zona, +10 si tiene el día en availability, + (entre 0-10) si ratePerHour es <=150
      let mejor = null;
      let mejorScore = -1;

      for (const w of list) {
        const zonas = w.zones || [];
        const avail = (w.availability || []).map(a => a.day);
        const rate = Number(w.ratePerHour || 0);

        let score = 0;
        if (zonas.includes(zone)) score += 20;
        if (avail.includes(day)) score += 10;
        if (rate > 0) {
          // mientras más barato (<=150), más puntos hasta 10
          const puntosPrecio = Math.max(0, Math.min(10, Math.round((150 - rate) / 15)));
          score += puntosPrecio;
        }

        if (score > mejorScore) {
          mejor = { ...w, score };
          mejorScore = score;
        }
      }

      setBest(mejor || null);

      if (!list.length) {
        Alert.alert('Sin resultados', 'No se encontraron paseadores con esos filtros.');
      } else if (mejor) {
        Alert.alert('¡Listo!', `Mejor coincidencia encontrada (score ${mejor.score}).`);
      }
    } catch (e) {
      console.error('buscarPaseador error', e);
      Alert.alert('Error', 'No se pudo buscar paseadores.');
    } finally {
      setLoading(false);
    }
  };

  // Reservar paseo (intenta llamar a tu backend /reservas)
  const reservarPaseo = async () => {
    if (!user?.id) {
      Alert.alert('Sesión requerida', 'Inicia sesión para reservar.');
      return;
    }
    if (!best?._id) {
      Alert.alert('Selecciona un paseador', 'Primero busca y elige un paseador.');
      return;
    }

    try {
      const token = await SecureStore.getItemAsync('token');

      const body = {
        clientId: user.id,            // id del cliente (desde /auth/login)
        walkerId: best._id,           // id del walker seleccionado
        zone,                         // zona elegida
        date: new Date().toISOString(),
        duration: '45m',              // placeholder
        notes: 'Reserva desde app',   // placeholder
      };

      const res = await fetch(`${API_URL}/reservas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      // Si aún no tienes /reservas en el backend, devolvemos aviso claro
      if (res.status === 404 || res.status === 501) {
        Alert.alert('Próxima versión', 'El endpoint de reservas aún no está activo en el backend.');
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || 'No se pudo crear la reserva.');
      }

      Alert.alert('Reserva confirmada', `Reserva creada con ID: ${data?.id || 'N/A'}`);
    } catch (e) {
      console.error('reservarPaseo error', e);
      Alert.alert('Error', e.message || 'No se pudo completar la reserva.');
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
    navigation.replace('Inicio');
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <FontAwesome5 name="user" size={20} color="#1976d2" />
      <Text style={styles.nombre}>{item?.user?.name || 'Paseador'}</Text>
      <Text style={styles.info}>🗺️ Zonas: {(item.zones || []).join(', ') || '-'}</Text>
      <Text style={styles.info}>🗓️ Días: {(item.availability || []).map(a => a.day).join(', ') || '-'}</Text>
      <Text style={styles.info}>💲 {item.ratePerHour || 0}/hora</Text>
      {best?._id === item._id ? (
        <Text style={[styles.info, { fontWeight: 'bold' }]}>⭐ Mejor coincidencia (score {best.score})</Text>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🐾 ¡Hola {user?.name || 'Cliente'}!</Text>

      {/* Filtros */}
      <View style={styles.filters}>
        <TextInput
          style={styles.input}
          value={zone}
          onChangeText={setZone}
          placeholder="Zona (ej. Roma)"
        />
        <TextInput
          style={styles.input}
          value={day}
          onChangeText={setDay}
          placeholder="Día (mon|tue|wed|thu|fri|sat|sun)"
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={buscarPaseador} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Buscando...' : '🔍 Buscar Paseador'}</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 12 }} size="large" />
      ) : null}

      {/* Mejor coincidencia */}
      {best && (
        <View style={styles.resultado}>
          <Text style={styles.resultadoText}>✅ Mejor paseador:</Text>
          <Text style={styles.resultadoText}>👤 {(best.user?.name) || 'Paseador'}</Text>
          <Text style={styles.resultadoText}>🗺️ Zonas: {(best.zones || []).join(', ') || '-'}</Text>
          <Text style={styles.resultadoText}>💲 {best.ratePerHour || 0}/hora</Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#4caf50', marginTop: 10 }]}
            onPress={reservarPaseo}
          >
            <Text style={styles.buttonText}>📅 Reservar Paseo</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Lista completa */}
      <FlatList
        data={walkers}
        keyExtractor={(item, idx) => String(item._id || idx)}
        renderItem={renderItem}
        ListEmptyComponent={!loading && (
          <Text style={{ textAlign: 'center', marginTop: 16 }}>No hay paseadores aún.</Text>
        )}
        contentContainerStyle={{ paddingVertical: 8 }}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#1976d2', marginTop: 10 }]}
        onPress={() => navigation.navigate('HistorialCliente', { userId: user?.id })}
      >
        <Text style={styles.buttonText}>📖 Ver historial</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>🔓 Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, justifyContent: 'flex-start' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#ff5f45' },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  input: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 12, height: 42 },
  button: { backgroundColor: '#ff5f45', padding: 12, borderRadius: 10, alignItems: 'center', marginVertical: 5 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  resultado: { backgroundColor: '#e8f5e9', padding: 15, borderRadius: 10, marginTop: 12 },
  resultadoText: { fontSize: 16, marginBottom: 5 },
  card: { backgroundColor: '#f0f4ff', padding: 15, borderRadius: 12, marginVertical: 6 },
  nombre: { fontSize: 18, fontWeight: 'bold', marginTop: 6, marginBottom: 6, color: '#1976d2' },
  info: { fontSize: 14, marginVertical: 2 },
  logoutButton: { marginTop: 12, padding: 12, alignItems: 'center' },
  logoutText: { fontSize: 16, color: '#d32f2f', fontWeight: 'bold' },
});
