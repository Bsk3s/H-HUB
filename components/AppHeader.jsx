import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu, LogOut, User, Settings, HelpCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { supabase } from '../../../src/auth/supabase-client';

const AppHeader = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsMenuOpen(true);
  };

  const handleLogout = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await supabase.auth.signOut();
      setIsMenuOpen(false);
      router.replace('/(auth)/Email-sign-in');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  const menuItems = [
    { icon: User, label: 'Profile', onPress: () => { setIsMenuOpen(false); router.push('/profile'); } },
    { icon: Settings, label: 'Settings', onPress: () => { setIsMenuOpen(false); router.push('/settings'); } },
    { icon: HelpCircle, label: 'Help', onPress: () => { setIsMenuOpen(false); router.push('/help'); } },
    { icon: LogOut, label: 'Logout', onPress: handleLogout },
  ];

  return (
    <>
      <View 
        style={{ paddingTop: insets.top }} 
        className="bg-white px-4 py-4 border-b border-gray-100"
      >
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-semibold text-gray-900">
            Heavenly Hub
          </Text>
          <TouchableOpacity onPress={handleMenuPress}>
            <Menu size={24} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Hamburger Menu Modal */}
      <Modal
        visible={isMenuOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <Pressable 
          className="flex-1 bg-black/50"
          onPress={() => setIsMenuOpen(false)}
        >
          <View className="flex-1 justify-start items-end pt-20 pr-4">
            <View className="bg-white rounded-lg shadow-lg min-w-[200px]">
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={item.onPress}
                  className={`flex-row items-center px-4 py-3 ${
                    index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <item.icon size={20} color="#374151" className="mr-3" />
                  <Text className="text-gray-700 font-medium ml-3">
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

export default AppHeader; 