import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu, LogOut, User, Settings, HelpCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography } from '../../../theme';

/**
 * AppHeader Component
 * 
 * Main navigation header with "Heavenly Hub" branding and hamburger menu.
 * Preserves exact HB1 design using theme system instead of Tailwind.
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
            <Menu size={24} color={colors.gray700} />
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
                <item.icon size={20} color={colors.gray700} style={styles.menuIcon} />
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
 * Styles using theme system
 * Preserves exact HB1 design with consistent spacing/colors
 */
const styles = StyleSheet.create({
  // Header styles (matches: bg-white px-4 py-4 border-b border-gray-100)
  header: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,  // px-4 equivalent
    paddingVertical: spacing.lg,    // py-4 equivalent
  },
  
  // Title styles (matches: text-2xl font-semibold text-gray-900)
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray900,
  },
  
  menuButton: {
    // No specific Tailwind equivalent - clean touch target
  },
  
  // Modal styles (matches HB1 design)
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80,  // pt-20 equivalent
    paddingRight: spacing.lg,
  },
  
  // Modal content (matches: bg-white rounded-lg shadow-lg min-w-[200px])
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,  // rounded-lg
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,  // Android shadow
  },
  
  // Menu item styles (matches: flex-row items-center px-4 py-3)
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  
  menuIcon: {
    marginRight: spacing.md,  // Spacing between icon and text
  },
  
  // Menu text (matches: text-gray-700 font-medium ml-3)
  menuItemText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray700,
  },
  
  destructiveText: {
    color: colors.destructive,
  },
});

export default AppHeader; 