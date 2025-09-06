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
// Si ya creaste config.js, usa esta línea:
import { API_URL } from '../config';
// Si no, puedes dejar temporalmente:
// const API_URL = 'https://paseos-api-h664.onrender.com/api';

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

      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: correo.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || 'Error al iniciar sesión');
      }

      // Guarda token y usuario para reutilizar en otras pantallas
      if (data?.token) await SecureStore.setItemAsync('token', data.token);
      if (data?.user)  await SecureStore.setItemAsync('user', JSON.stringify(data.user));

      // Navega según el rol (replace para que no vuelva al login con "atrás")
      if (data.user.role === 'cliente') {
        navigation.replace('Cliente');
      } else if (data.user.role === 'paseador') {
        navigation.replace('Paseador');
      } else {
        navigation.replace('Inicio');
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const recuperarContrasena = () => {
    Alert.alert('Recuperación', 'En la siguiente versión podrás restablecer tu contraseña.');
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

      <TouchableOpacity onPress={recuperarContrasena}>
        <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
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
  linkText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#1976d2',
    fontWeight: '600',
  },
});
