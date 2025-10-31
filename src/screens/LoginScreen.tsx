
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, ScrollView, useColorScheme, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import tw from '../lib/tailwind';
import { useAuth } from '../context/AuthContext';

type Props = { onLogin?: () => void };

const LoginScreen: React.FC<Props> = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@clinic.com');
  const [password, setPassword] = useState('admin123');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const { login, loading } = useAuth();
  const isDark = useColorScheme() === 'dark';

  const handleLoginPress = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    
    // No client-side validation per spec (FR-023) - submit immediately
    // Backend will handle all validation
    
    try {
      await login(trimmedEmail, trimmedPassword);
      // Login successful - navigation handled by App.tsx based on isAuthenticated
      onLogin?.();
    } catch (error) {
      // Generic error message per spec (FR-010)
      Alert.alert('Login Failed', 'Login failed. Please try again.');
    }
  };


  const iconColor = isDark ? tw.color('border-dark') : tw.color('border-light');
  const placeholderTextColor = isDark ? tw.color('border-dark') : tw.color('border-light');

  return (
    <SafeAreaView style={tw`flex-1 bg-background-light dark:bg-background-dark`} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View style={tw`w-full max-w-md p-8 space-y-8 self-center`}>
          <View style={tw`flex flex-col items-center text-center`}>
            <View style={tw`mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20`}>
              <Icon name="local-hospital" size={32} color="#4A90E2" />
            </View>
            <Text style={tw`text-3xl font-bold text-text-light dark:text-text-dark tracking-tight`}>Welcome Back</Text>
            <Text style={tw`mt-2 text-base text-text-light/70 dark:text-text-dark/70`}>Please enter your credentials to continue.</Text>
          </View>
          <View style={tw`space-y-6`}>
            <View style={tw`flex flex-col`}>
              <Text style={tw`mb-2 text-sm font-medium text-text-light dark:text-text-dark`}>Email Address</Text>
              <View style={tw`relative flex-row items-center`}>
                <Icon name="person" size={24} color={iconColor} style={{ position: 'absolute', left: 16 }} />
                <TextInput
                  style={tw`w-full rounded-lg border border-border-light bg-surface-light dark:border-border-dark dark:bg-surface-dark py-3 pl-12 pr-4 text-text-light dark:text-text-dark h-14`}
                  placeholder="Enter your email"
                  placeholderTextColor={placeholderTextColor}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>
            <View style={tw`flex flex-col`}>
              <Text style={tw`mb-2 text-sm font-medium text-text-light dark:text-text-dark`}>Password</Text>
              <View style={tw`relative flex-row items-center`}>
                <Icon name="lock" size={24} color={iconColor} style={{ position: 'absolute', left: 16 }}/>
                <TextInput
                  style={tw`w-full rounded-lg border border-border-light bg-surface-light dark:border-border-dark dark:bg-surface-dark py-3 pl-12 pr-12 text-text-light dark:text-text-dark h-14`}
                  placeholder="Enter your password"
                  placeholderTextColor={placeholderTextColor}
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity style={tw`absolute right-4`} onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                  <Icon name={isPasswordVisible ? 'visibility' : 'visibility-off'} size={24} color={iconColor} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity>
                <Text style={tw`mt-2 text-right text-sm font-medium text-primary`}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={tw`flex-row items-center justify-between rounded-lg bg-surface-light dark:bg-surface-dark p-4`}>
            <View>
              <Text style={tw`font-medium text-text-light dark:text-text-dark`}>Enable Biometric Login</Text>
              <Text style={tw`text-sm text-text-light/70 dark:text-text-dark/70`}>Use Fingerprint or Face ID</Text>
            </View>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isBiometricEnabled ? '#4A90E2' : '#f4f3f4'}
              onValueChange={() => setIsBiometricEnabled(previousState => !previousState)}
              value={isBiometricEnabled}
            />
          </View>
          <TouchableOpacity 
            style={tw`flex w-full items-center justify-center rounded-lg bg-primary py-3.5 h-14 shadow-md ${loading ? 'opacity-50' : ''}`}
            onPress={handleLoginPress}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={tw`text-base font-semibold text-white`}>Log In</Text>
            )}
          </TouchableOpacity>
          <View style={tw`pt-4 text-center`}>
            <Text style={tw`text-xs text-text-light/60 dark:text-text-dark/60`}>
              App Version 1.0.0 | <Text style={tw`underline text-primary`}>Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;