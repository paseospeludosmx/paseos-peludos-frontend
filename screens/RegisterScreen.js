import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Centraliza la URL de tu API
const API_URL = 'https://paseos-api-h664.onrender.com/api';

export default function RegisterScreen({ navigation }) {
  const [rol, setRol] = useState(null);

  // Comunes
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');

  // Cliente: datos del perro
  const [nombrePerro, setNombrePerro] = useState('');
  const [raza, setRaza] = useState('');
  const [edad, setEdad] = useState('');
  const [peso, setPeso] = useState('');
  const [nivelEnergia, setNivelEnergia] = useState('');
  const [sociable, setSociable] = useState('');
  const [climaPreferido, setClimaPreferido] = useState('');

  // Paseador: perfil profesional (texto libre que mapeamos a los campos del backend)
  const [experienciaAnios, setExperienciaAnios] = useState('');
  const [razasManejadas, setRazasManejadas] = useState('');
  const [aceptaPerrosGrandes, setAceptaPerrosGrandes] = useState('');
  const [zonasAutorizadas, setZonasAutorizadas] = useState('');
  const [nivelEnergiaPaseador, setNivelEnergiaPaseador] = useState('');
  const [climasPreferidos, setClimasPreferidos] = useState('');
  const [loading, setLoading] = useState(false);

  const guardarSesion = async (token, user) => {
    if (token) await SecureStore.setItemAsync('token', token);
    if (user) await SecureStore.setItemAsync('user', JSON.stringify(user));
  };

  const handleRegistro = async () => {
    try {
      if (!rol || !nombre || !correo || !password || !confirmar) {
        Alert.alert('Faltan datos', 'Completa todos los campos obligatorios.');
        return;
      }
      if (password !== confirmar) {
        Alert.alert('Error', 'Las contraseñas no coinciden.');
        return;
      }
      setLoading(true);

      // ---------- REGISTRO CLIENTE ----------
      if (rol === 'cliente') {
        if (!nombrePerro || !raza || !edad || !peso || !nivelEnergia || !sociable || !climaPreferido) {
          Alert.alert('Faltan datos del perro', 'Completa toda la información del perrito.');
          setLoading(false);
          return;
        }

        const body = {
          name: nombre,
          email: correo.trim().toLowerCase(),
          password,
          phone: '',
          // El backend recibirá un dog sencillo. Puedes ampliarlo luego.
          dog: {
            name: nombrePerro,
            breed: raza,
            ageYears: Number(edad) || 0,
            weightKg: Number(peso) || 0,
            notes: `Energía: ${nivelEnergia}. Sociable: ${sociable}. Clima: ${climaPreferido}.`,
          },
        };

        const res = await fetch(`${API_URL}/auth/register-client`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || 'No se pudo registrar como cliente');

        await guardarSesion(data?.token, data?.user);
        Alert.alert('¡Registro exitoso!', `Bienvenido/a ${nombre} como cliente`);
        navigation.replace('Cliente');
        return;
      }

      // ---------- REGISTRO PASEADOR ----------
      if (rol === 'paseador') {
        if (
          !experienciaAnios ||
          !razasManejadas ||
          !aceptaPerrosGrandes ||
          !zonasAutorizadas ||
          !nivelEnergiaPaseador ||
          !climasPreferidos
        ) {
          Alert.alert('Faltan datos como paseador', 'Completa tu perfil profesional completo.');
          setLoading(false);
          return;
        }

        const body = {
          name: nombre,
          email: correo.trim().toLowerCase(),
          password,
          phone: '',
          bio: `Experiencia: ${experienciaAnios} años. Razas: ${razasManejadas}. Acepta grandes: ${aceptaPerrosGrandes}. Energía: ${nivelEnergiaPaseador}. Climas: ${climasPreferidos}.`,
          zones: zonasAutorizadas
            .split(',')
            .map((z) => z.trim())
            .filter(Boolean),
          availability: [
            { day: 'sat', slots: [] },
            { day: 'sun', slots: [] },
          ], // puedes editar en tu perfil luego
          ratePerHour: 100, // valor por defecto
        };

        const res = await fetch(`${API_URL}/auth/register-walker`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || 'No se pudo registrar como paseador');

        await guardarSesion(data?.token, data?.user);
        Alert.alert('¡Registro exitoso!', `Bienvenido/a ${nombre} como paseador`);
        navigation.replace('Paseador');
        return;
      }
    } catch (error) {
      console.error('Error en registro:', error?.message);
      Alert.alert('Error', error?.message || 'No se pudo completar el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.scroll}>
      <View style={styles.container}>
        <Text style={styles.title}>Crear cuenta</Text>

        <Text style={styles.label}>¿Qué eres?</Text>
        <View style={styles.rolContainer}>
          <TouchableOpacity
            style={[styles.rolButton, rol === 'cliente' && styles.rolActivo]}
            onPress={() => setRol('cliente')}
          >
            <Text style={styles.rolText}>Cliente</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rolButton, rol === 'paseador' && styles.rolActivo]}
            onPress={() => setRol('paseador')}
          >
            <Text style={styles.rolText}>Paseador</Text>
          </TouchableOpacity>
        </View>

        <TextInput placeholder="Nombre completo" value={nombre} onChangeText={setNombre} style={styles.input} />
        <TextInput
          placeholder="Correo electrónico"
          value={correo}
          onChangeText={setCorreo}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput placeholder="Contraseña" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
        <TextInput placeholder="Confirmar contraseña" value={confirmar} onChangeText={setConfirmar} style={styles.input} secureTextEntry />

        {rol === 'cliente' && (
          <>
            <TextInput placeholder="Nombre del perro" value={nombrePerro} onChangeText={setNombrePerro} style={styles.input} />
            <TextInput placeholder="Raza" value={raza} onChangeText={setRaza} style={styles.input} />
            <TextInput placeholder="Edad (años)" value={edad} onChangeText={setEdad} style={styles.input} keyboardType="numeric" />
            <TextInput placeholder="Peso (kg)" value={peso} onChangeText={setPeso} style={styles.input} keyboardType="numeric" />
            <TextInput placeholder="Nivel de energía (baja/media/alta)" value={nivelEnergia} onChangeText={setNivelEnergia} style={styles.input} />
            <TextInput placeholder="¿Es sociable? (sí/no)" value={sociable} onChangeText={setSociable} style={styles.input} />
            <TextInput placeholder="Clima preferido (soleado/templado/frío/nublado)" value={climaPreferido} onChangeText={setClimaPreferido} style={styles.input} />
          </>
        )}

        {rol === 'paseador' && (
          <>
            <TextInput placeholder="Años de experiencia" value={experienciaAnios} onChangeText={setExperienciaAnios} style={styles.input} keyboardType="numeric" />
            <TextInput placeholder="Razas que manejas (separadas por coma)" value={razasManejadas} onChangeText={setRazasManejadas} style={styles.input} />
            <TextInput placeholder="¿Aceptas perros grandes? (sí/no)" value={aceptaPerrosGrandes} onChangeText={setAceptaPerrosGrandes} style={styles.input} />
            <TextInput placeholder="Zonas donde paseas (separadas por coma)" value={zonasAutorizadas} onChangeText={setZonasAutorizadas} style={styles.input} />
            <TextInput placeholder="Tu nivel de energía (baja/media/alta)" value={nivelEnergiaPaseador} onChangeText={setNivelEnergiaPaseador} style={styles.input} />
            <TextInput placeholder="Climas preferidos (separados por coma)" value={climasPreferidos} onChangeText={setClimasPreferidos} style={styles.input} />
          </>
        )}

        <TouchableOpacity style={styles.button} onPress={handleRegistro} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Creando...' : 'Crear cuenta'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { backgroundColor: '#fff8f0' },
  container: { flex: 1, paddingHorizontal: 30, paddingVertical: 40 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#ff5f45', marginBottom: 25, textAlign: 'center' },
  label: { fontSize: 16, marginBottom: 10 },
  rolContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  rolButton: { paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#ccc', borderRadius: 8 },
  rolActivo: { backgroundColor: '#1976d2' },
  rolText: { color: '#fff', fontWeight: 'bold' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#ff6f00',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});
