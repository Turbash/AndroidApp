import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from './index';
import GoalsScreen from './goals';
import ProfileScreen from './profile';
import { ThemedText } from '../../components/ThemedText';

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="index"
        component={DashboardScreen}
        options={{ title: 'Home', tabBarIcon: () => <ThemedText>🏠</ThemedText> }}
      />
      <Tab.Screen
        name="goals"
        component={GoalsScreen}
        options={{ title: 'Goals', tabBarIcon: () => <ThemedText>🎯</ThemedText> }}
      />
      <Tab.Screen
        name="profile"
        component={ProfileScreen}
        options={{ title: 'Profile', tabBarIcon: () => <ThemedText>👤</ThemedText> }}
      />
    </Tab.Navigator>
  );
}