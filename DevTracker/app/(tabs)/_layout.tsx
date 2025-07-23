import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useColorScheme } from '../../hooks/useColorScheme';
import DashboardScreen from './index';
import GoalsScreen from './goals';
import ProfileScreen from './profile';

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  const tintColor = useThemeColor({}, 'tint');
  const tabIconDefault = useThemeColor({}, 'tabIconDefault');
  const backgroundColor = useThemeColor({}, 'background');
  const colorScheme = useColorScheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: tintColor,
        tabBarInactiveTintColor: tabIconDefault,
        tabBarStyle: {
          backgroundColor,
          borderTopWidth: 1,
          borderTopColor: useThemeColor({}, 'border'),
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="index"
        component={DashboardScreen}
        options={{ 
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <ThemedText style={{ fontSize: size, color }}>📊</ThemedText>
          )
        }}
      />
      <Tab.Screen
        name="goals"
        component={GoalsScreen}
        options={{ 
          title: 'Goals',
          tabBarIcon: ({ color, size }) => (
            <ThemedText style={{ fontSize: size, color }}>🎯</ThemedText>
          )
        }}
      />
      <Tab.Screen
        name="profile"
        component={ProfileScreen}
        options={{ 
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <ThemedText style={{ fontSize: size, color }}>👤</ThemedText>
          )
        }}
      />
    </Tab.Navigator>
  );
}