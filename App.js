// App.js
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import PantallaCliente from './screens/PantallaCliente';
// import PantallaPaseador from './screens/PantallaPaseador'; // ← ya no se usa aquí
import DisponiblesScreen from './screens/DisponiblesScreen';
import HistorialPaseosScreen from './screens/HistorialPaseosScreen';
import HistorialCliente from './screens/HistorialCliente';

// ⬇️ NUEVO: pantalla del paseador con botón "Ponerme disponible"
import PaseadorHome from './screens/PaseadorHome';

// URL pública de tu backend en Render
const API_URL = 'https://paseos-api-h664.onrender.com';

const Stack = createNativeStackNavigator();

export default function App() {
  // Test de conexión al arrancar (ayuda a detectar rutas/URL mal puestas)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/health`, {
          headers: { Accept: 'application/json' },
        });
        const text = await res.text();
        const ct = res.headers.get('content-type') || '';
        console.log('HEALTH status:', res.status);
        console.log('HEALTH ct:', ct);
        console.log('HEALTH body:', text);
        if (!ct.includes('application/json')) {
          console.warn('⚠️ La respuesta no es JSON. Revisa la ruta /health o el servidor.');
        }
      } catch (e) {
        console.log('HEALTH ERROR:', e.message);
      }
    })();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Inicio" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Registro" component={RegisterScreen} />
        <Stack.Screen name="Cliente" component={PantallaCliente} />
        {/* ⬇️ REGISTRO EXACTO DE LA PANTALLA "Paseador" */}
        <Stack.Screen name="Paseador" component={PaseadorHome} />
        <Stack.Screen name="Disponibles" component={DisponiblesScreen} />
        <Stack.Screen name="Historial" component={HistorialPaseosScreen} />
        <Stack.Screen name="HistorialCliente" component={HistorialCliente} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
