
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import InvoicesScreen from './src/screens/InvoicesScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import AuditLogScreen from './src/screens/AuditLogScreen';
import type { RootStackParamList, MainTabParamList } from './types';
import tw from './src/lib/tailwind';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const iconMap: Record<keyof MainTabParamList, string> = {
            Dashboard: 'dashboard',
            Invoices: 'receipt-long',
            AuditLog: 'history',
          };
          const iconName = iconMap[route.name];
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: isDark ? '#E0E0E0' : '#888',
        tabBarStyle: {
          backgroundColor: isDark ? '#111921' : '#f6f7f8',
          borderTopColor: isDark ? '#555555' : '#BDBDBD',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Invoices" component={InvoicesScreen} />
      <Tab.Screen name="AuditLog" component={AuditLogScreen} />
    </Tab.Navigator>
  );
}

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Set the color scheme for twrnc
  React.useEffect(() => {
    (tw as any).setColorScheme?.(colorScheme ?? 'light');
  }, [colorScheme]);

  const LoginScreenWithCallback = () => (
    <LoginScreen onLogin={() => setIsLoggedIn(true)} />
  );

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
          {isLoggedIn ? (
            <Stack.Group>
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen name="Payment" component={PaymentScreen} />
            </Stack.Group>
          ) : (
            <Stack.Group>
              <Stack.Screen name="Auth" component={LoginScreenWithCallback} />
            </Stack.Group>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
