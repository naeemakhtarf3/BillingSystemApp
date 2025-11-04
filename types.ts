import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Invoices: undefined;
  AuditLog: undefined;
};

export type RootStackParamList = {
  // FIX: The 'Auth' screen no longer receives params via navigation. It gets the onLogin callback as a direct prop.
  Auth: undefined;
  // Fix: Use NavigatorScreenParams to correctly type nested navigators. This ensures the parent navigator is aware of the child navigator's screens, resolving type conflicts.
  Main: NavigatorScreenParams<MainTabParamList>;
  Payment: undefined;
};