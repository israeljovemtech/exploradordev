/**
 * App.js — ExploradorDev
 * -------------------------------------------------------
 * Ponto de entrada do app com React Navigation (Stack).
 * Adicione novas fases como novas rotas no Stack.Navigator.
 *
 * Dependências necessárias (instale antes de rodar):
 *
 *   npx expo install expo-sensors
 *   npm install @react-navigation/native @react-navigation/native-stack
 *   npx expo install react-native-screens react-native-safe-area-context
 * -------------------------------------------------------
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// ── Telas ──────────────────────────────────────────────────
import HomeScreen from './src/screens/HomeScreen';
import Level2ExpoSensors from './src/screens/Level2ExpoSensors';
import Level4Haptics from './src/screens/Level4Haptics';

// Adicione futuras fases aqui:
// import Level3Screen from './src/screens/Level3Screen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          // Removemos o header padrão — cada tela cuida do próprio cabeçalho
          headerShown: false,
          // Transição suave entre telas
          animation: 'slide_from_right',
        }}
      >
        {/* Tela inicial / mapa de fases */}
        <Stack.Screen name="Home" component={HomeScreen} />

        {/* Fase 2 — Explorador em Movimento */}
        <Stack.Screen
          name="Level2"
          component={Level2ExpoSensors}
          options={{ gestureEnabled: true }}
        />

        {/* Fase 4 — Código de Vibração */}
        <Stack.Screen
          name="Level4"
          component={Level4Haptics}
          options={{ gestureEnabled: true }}
        />

        {/* Adicione fases futuras abaixo:
        <Stack.Screen name="Level3" component={Level3Screen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
