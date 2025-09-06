import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import PantallaCliente from './screens/PantallaCliente';
import PantallaPaseador from './screens/PantallaPaseador';
import DisponiblesScreen from './screens/DisponiblesScreen';
import HistorialPaseosScreen from './screens/HistorialPaseosScreen';
import HistorialCliente from './screens/HistorialCliente';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Inicio" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Registro" component={RegisterScreen} />
        <Stack.Screen name="Cliente" component={PantallaCliente} />
        <Stack.Screen name="Paseador" component={PantallaPaseador} />
        <Stack.Screen name="Disponibles" component={DisponiblesScreen} />
        <Stack.Screen name="Historial" component={HistorialPaseosScreen} />
        <Stack.Screen name="HistorialCliente" component={HistorialCliente} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
