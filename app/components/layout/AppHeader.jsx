import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu, LogOut, User, Settings, HelpCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

/**
 * AppHeader Component
 * 
 * Main navigation header with "Heavenly Hub" branding and hamburger menu.
 * Simple styling without external dependencies.
 */
const AppHeader = () => {
  const insets = useSafeAreaInsets();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsMenuOpen(true);
  };

  const handleLogout = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      console.log('Logout clicked - TODO: implement Supabase auth');
      setIsMenuOpen(false);
      console.log('Navigate to sign-in - TODO: implement React Navigation');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Menu configuration - easy to modify/extend
  const menuItems = [
    { 
      icon: User, 
      label: 'Profile', 
      onPress: () => { 
        setIsMenuOpen(false); 
        console.log('Navigate to profile - TODO: implement navigation'); 
      } 
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      onPress: () => { 
        setIsMenuOpen(false); 
        console.log('Navigate to settings - TODO: implement navigation'); 
      } 
    },
    { 
      icon: HelpCircle, 
      label: 'Help', 
      onPress: () => { 
        setIsMenuOpen(false); 
        console.log('Navigate to help - TODO: implement navigation'); 
      } 
    },
    { 
      icon: LogOut, 
      label: 'Logout', 
      onPress: handleLogout,
      destructive: true  // Special styling for destructive actions
    },
  ];

  return (
    <>
      {/* Main Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Heavenly Hub</Text>
          <TouchableOpacity onPress={handleMenuPress} style={styles.menuButton}>
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
        <Pressable style={styles.modalOverlay} onPress={() => setIsMenuOpen(false)}>
          <View style={styles.modalContent}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={item.onPress}
                style={[
                  styles.menuItem,
                  index !== menuItems.length - 1 && styles.menuItemBorder
                ]}
              >
                <item.icon size={20} color="#374151" style={styles.menuIcon} />
                <Text style={[
                  styles.menuItemText,
                  item.destructive && styles.destructiveText
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

/**
 * Simple styles without external theme dependencies
 */
const styles = StyleSheet.create({
  // Header styles
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  
  // Title styles
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
  },
  
  menuButton: {
    // Clean touch target
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 16,
  },
  
  // Modal content
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  
  // Menu item styles
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  
  menuIcon: {
    marginRight: 12,
  },
  
  // Menu text
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  
  destructiveText: {
    color: '#dc2626',
  },
});

export default AppHeader;