import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useColorScheme } from '../../hooks/useColorScheme';
import DashboardScreen from './index';
import GoalsScreen from './goals';
import ProfileScreen from './profile';
import { ThemedText } from '../../components/ThemedText';

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
          paddingBottom: 2,
          paddingTop: 2,
          height: 52,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 0,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="index"
        component={DashboardScreen}
        options={{ 
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <ThemedText style={{ fontSize: 18, color }}>🏠</ThemedText>
          )
        }}
      />
      <Tab.Screen
        name="goals"
        component={GoalsScreen}
        options={{ 
          title: 'Goals',
          tabBarIcon: ({ color }) => (
            <ThemedText style={{ fontSize: 18, color }}>✅</ThemedText>
          )
        }}
      />
      <Tab.Screen
        name="profile"
        component={ProfileScreen}
        options={{ 
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <ThemedText style={{ fontSize: 18, color }}>�‍♂️</ThemedText>
          )
        }}
      />
    </Tab.Navigator>
  );
}