import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const API_URL = 'https://paseos-api-h664.onrender.com/api';

export default function DisponiblesScreen({ navigation }) {
  const [paseadores, setPaseadores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/walkers?zone=Roma&day=sat`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setPaseadores(data);
        } else {
          setPaseadores([]);
        }
      } catch (error) {
        console.error('Error cargando paseadores:', error);
        setPaseadores([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <FontAwesome5 name="user" size={20} color="#1976d2" />
      <Text style={styles.nombre}>{item?.user?.name || 'Paseador'}</Text>
      <Text style={styles.info}>🗺️ Zonas: {(item.zones || []).join(', ') || '-'}</Text>
      <Text style={styles.info}>⚡ Energía: {item.bio || 'Sin info'}</Text>
      <Text style={styles.info}>💲 {item.ratePerHour || 0}/hora</Text>
      <TouchableOpacity style={styles.seleccionar}>
        <Text style={styles.seleccionarTexto}>Seleccionar Paseador</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👀 Paseadores Disponibles</Text>

      {loading ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>Cargando...</Text>
      ) : paseadores.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>No hay paseadores disponibles</Text>
      ) : (
        <FlatList
          data={paseadores}
          keyExtractor={(item, idx) => String(item._id || idx)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity style={styles.autoButton} onPress={() => navigation.navigate('Cliente')}>
        <Text style={styles.autoText}>🔍 Buscar mejor opción automática</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff8f0', padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ff5f45',
    marginBottom: 20,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#f0f4ff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
  },
  nombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    marginTop: 10,
    marginBottom: 6,
  },
  info: {
    fontSize: 14,
    marginVertical: 2,
  },
  seleccionar: {
    marginTop: 10,
    backgroundColor: '#4caf50',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  seleccionarTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
  autoButton: {
    marginTop: 20,
    backgroundColor: '#1976d2',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  autoText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
