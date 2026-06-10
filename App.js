import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import Fase1CameraScreen from './src/screens/Fase1CameraScreen';
import Level2ExpoSensors from './src/screens/Level2ExpoSensors';
import Fase3NotificacaoScreen from './src/screens/Fase3NotificacaoScreen';
import Level4Haptics from './src/screens/Level4Haptics';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Fase1" component={Fase1CameraScreen} options={{ gestureEnabled: true }} />
        <Stack.Screen name="Level2" component={Level2ExpoSensors} options={{ gestureEnabled: true }} />
        <Stack.Screen name="Fase3" component={Fase3NotificacaoScreen} options={{ gestureEnabled: true }} />
        <Stack.Screen name="Level4" component={Level4Haptics} options={{ gestureEnabled: true }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
