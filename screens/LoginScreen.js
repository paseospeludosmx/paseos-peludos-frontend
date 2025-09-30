import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config'; // debe traer .../api

export default function LoginScreen({ navigation }) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const iniciarSesion = async () => {
    try {
      if (!correo || !password) {
        Alert.alert('Faltan datos', 'Ingresa correo y contraseña');
        return;
      }
      setLoading(true);

      const url = `${API_URL}/auth/login`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email: correo.trim().toLowerCase(),
          password,
        }),
      });

      const status = res.status;
      const ct = res.headers.get('content-type') || '';
      const raw = await res.text();   // leemos texto crudo para poder loguear errores HTML/404
      let data = null;
      try { data = JSON.parse(raw); } catch {}

      console.log('LOGIN DEBUG =>', {
        url,
        status,
        contentType: ct,
        raw: raw?.slice(0, 400) // recorte para que no sea enorme
      });

      if (!ct.includes('application/json')) {
        throw new Error(`Respuesta no JSON (${status}). Revisa que API_URL tenga /api y el endpoint sea /auth/login`);
      }
      if (!res.ok) {
        throw new Error(data?.message || `HTTP ${status}`);
      }

      const token = data?.token;
      const user  = data?.user;

      if (!token || !user) {
        throw new Error('El backend no devolvió { token, user }.');
      }

      await SecureStore.setItemAsync('token', token);
      await SecureStore.setItemAsync('user', JSON.stringify(user));

      // navega a pantallas que EXISTEN en tu navigator
      const role = (user.role || user.type || '').toLowerCase();
      const destino = role === 'paseador' ? 'Paseador' : 'Cliente';
      navigation.reset({ index: 0, routes: [{ name: destino }] });
    } catch (e) {
      console.error('Error en login:', e?.message);
      Alert.alert('Error', e?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>

      <TextInput
        placeholder="Correo electrónico"
        value={correo}
        onChangeText={setCorreo}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={iniciarSesion} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8f0',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ff5f45',
    marginBottom: 30,
    textAlign: 'center',
  },
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
    backgroundColor: '#1976d2',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});
