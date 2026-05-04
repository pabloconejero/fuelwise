import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import FuelLogScreen from '../screens/FuelLogScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CustomNavi from './CustomNavi';

export type TabParamList = {
  Home: undefined;
  FuelLog: undefined;
  Stats: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: 'transparent', borderTopWidth: 0 } }}
      tabBar={(props) => <CustomNavi {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="FuelLog" component={FuelLogScreen} options={{ title: 'Fuel Log' }} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
