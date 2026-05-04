import { View, TouchableOpacity, StyleSheet, AccessibilityInfo } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Fuel, BarChart2, Settings } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const ICONS: Record<string, React.FC<{ color: string; size: number }>> = {
  Home: Home,
  FuelLog: Fuel,
  Stats: BarChart2,
  Settings: Settings,
};

const LABELS: Record<string, string> = {
  Home: 'Home',
  FuelLog: 'Fuel Log',
  Stats: 'Stats',
  Settings: 'Settings',
};

export default function CustomNavi({ state, navigation }: BottomTabBarProps) {

  const handleTabChange = async (route: (typeof state.routes)[number]) => {
    const reduceMotion = await AccessibilityInfo.isReduceMotionEnabled();
    if (!reduceMotion) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      } catch {
        // haptics unavailable — continue silently
      }
    }
    navigation.navigate(route.name);
  };

  return (
    <View style={styles.container} accessibilityRole="tablist">
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const Icon = ICONS[route.name];
        const color = isFocused ? '#000' : '#767676';

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tab}
            onPress={() => handleTabChange(route)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={LABELS[route.name] ?? route.name}
          >
            {Icon && <Icon color={color} size={28} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    height: 64,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 26,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
});
