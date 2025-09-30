import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    let sound;

    const boot = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        sound = new Audio.Sound();
        await sound.loadAsync(require('../assets/ladrido.mp3'));
        await sound.playAsync();
      } catch (e) {
        console.log('Error reproduciendo sonido:', e?.message || e);
      }
    };

    boot();

    const timer = setTimeout(() => {
      navigation.replace('Inicio');
    }, 2500);

    return () => {
      clearTimeout(timer);
      if (sound) sound.unloadAsync().catch(() => {});
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
  container: { flex: 1, backgroundColor: '#fff8f0', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 30, fontWeight: 'bold', color: '#ff5f45' },
  subtitle: { fontSize: 16, color: '#333', marginTop: 10 },
});