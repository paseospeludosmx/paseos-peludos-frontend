import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const API_URL = 'https://paseos-api-h664.onrender.com/api';

export default function HistorialPaseosScreen({ route }) {
  const [paseos, setPaseos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Id del paseador logueado, pásalo con route.params o contexto
  const walkerId = route?.params?.walkerId || null;

  useEffect(() => {
    (async () => {
      try {
        if (!walkerId) {
          setPaseos([]);
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/reservas?walker=${walkerId}`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setPaseos(data);
        } else {
          setPaseos([]);
        }
      } catch (err) {
        console.error('Error al obtener paseos:', err);
        setPaseos([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [walkerId]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <FontAwesome5 name="paw" size={20} color="#ff5f45" />
      <Text style={styles.perro}>🐶 {item?.dog?.name || 'Perro'}</Text>
      <Text style={styles.info}>📍 Zona: {item?.zone || '-'}</Text>
      <Text style={styles.info}>🕒 Duración: {item?.duration || 'N/A'}</Text>
      <Text style={styles.info}>
        📅 Fecha: {item?.date ? new Date(item.date).toLocaleDateString() : '-'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📖 Historial de Paseos</Text>

      {loading ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>Cargando...</Text>
      ) : (
        <FlatList
          data={paseos}
          keyExtractor={(item, idx) => String(item._id || idx)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 20 }}>
              No tienes paseos registrados.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff8f0', padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f0f4ff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  perro: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 6,
    marginBottom: 6,
    color: '#ff5f45',
  },
  info: { fontSize: 15, marginVertical: 2 },
});
