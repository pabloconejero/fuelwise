import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import TabNavigator from './src/navigation/TabNavigator';
import LocationProvider from './src/providers/LocationProvider';

export default function App() {
  return (
    <NavigationContainer>
      <LocationProvider/>
      <StatusBar style="auto" />
      <TabNavigator />
    </NavigationContainer>
  );
}
