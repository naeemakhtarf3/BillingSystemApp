/**
 * UserProfileIcon Component
 * 
 * Reusable component that displays a profile icon and shows user profile information
 * in a modal/popover when tapped, including logout functionality
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, useColorScheme } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import tw from '../lib/tailwind';
import { useAuth } from '../context/AuthContext';

interface UserProfileIconProps {
  iconSize?: number;
  iconColor?: string;
}

const UserProfileIcon: React.FC<UserProfileIconProps> = ({ 
  iconSize = 24, 
  iconColor = '#FFFFFF' 
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { user, logout } = useAuth();
  const isDark = useColorScheme() === 'dark';

  const handleLogout = async () => {
    try {
      await logout();
      setModalVisible(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const formatRole = (role: string) => {
    return role.replace('_', ' ');
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <TouchableOpacity 
        onPress={() => setModalVisible(true)}
        style={tw`flex size-10 items-center justify-center rounded-full`}
      >
        <Icon name="account-circle" size={iconSize} color={iconColor} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={tw`flex-1 bg-black/50 items-center justify-center`}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={tw`bg-surface-light dark:bg-surface-dark rounded-xl p-6 w-80 shadow-lg`}
          >
            <View style={tw`items-center mb-6`}>
              <View style={tw`flex size-16 items-center justify-center rounded-full bg-primary/20 mb-4`}>
                <Icon name="account-circle" size={48} color="#4A90E2" />
              </View>
              <Text style={tw`text-xl font-bold text-text-light dark:text-text-dark`}>
                {user.name}
              </Text>
              <Text style={tw`text-base text-text-light/70 dark:text-text-dark/70 mt-1`}>
                {formatRole(user.role)}
              </Text>
            </View>

            <TouchableOpacity
              style={tw`bg-primary rounded-lg py-3 px-4 items-center mt-4`}
              onPress={handleLogout}
            >
              <Text style={tw`text-base font-semibold text-white`}>Logout</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default UserProfileIcon;

