import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    let sound;
    const playSound = async () => {
      try {
        sound = new Audio.Sound();
        await sound.loadAsync(require('../assets/ladrido.mp3'));
        await sound.playAsync();
      } catch (error) {
        console.log('Error reproduciendo sonido:', error);
      }
    };
    playSound();

    const timer = setTimeout(() => {
      navigation.replace('Inicio');
    }, 2500);

    return () => {
      clearTimeout(timer);
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🐾 Paseos Peludos 🐾</Text>
      <Text style={styles.subtitle}>Tu app de paseos de confianza</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ff5f45',
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
});