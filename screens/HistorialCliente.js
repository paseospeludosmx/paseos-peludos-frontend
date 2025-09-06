import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const API_URL = 'https://paseos-api-h664.onrender.com/api';

export default function HistorialCliente({ route }) {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Si tienes el id del usuario logueado, pásalo en route.params o desde el contexto
  const userId = route?.params?.userId || null;

  useEffect(() => {
    (async () => {
      try {
        if (!userId) {
          setReservas([]);
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/reservas?cliente=${userId}`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setReservas(data);
        } else {
          setReservas([]);
        }
      } catch (error) {
        console.error('Error al obtener historial:', error);
        setReservas([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📖 Historial de Paseos</Text>

      {loading ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>Cargando...</Text>
      ) : (
        <FlatList
          data={reservas}
          keyExtractor={(item, idx) => String(item._id || idx)}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text>🐶 {item?.dog?.name || 'Perro'}</Text>
              <Text>👤 Paseador: {item?.walker?.user?.name || 'Desconocido'}</Text>
              <Text>📍 Zona: {item?.zone || '-'}</Text>
              <Text>🕓 Fecha: {item?.date ? new Date(item.date).toLocaleString() : '-'}</Text>
            </View>
          )}
          ListEmptyComponent={<Text>No tienes paseos registrados.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff8f0', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#ff5f45', marginBottom: 20 },
  card: {
    backgroundColor: '#e0f2f1',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
});
