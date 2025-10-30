import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu, LogOut, User, Settings, HelpCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../src/auth/context';
import { useTheme } from '../src/hooks/useTheme';

/**
 * AppHeader Component
 * 
 * Main navigation header with "Heavenly Hub" branding and hamburger menu.
 * Simple styling without external dependencies.
 */
const AppHeader = ({ navigation }) => {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Add error handling for useAuth
    let logout;
    try {
        const authContext = useAuth();
        logout = authContext?.logout;
    } catch (error) {
        console.error('❌ AppHeader: useAuth error:', error);
        logout = () => console.log('Logout not available');
    }

    const handleMenuPress = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsMenuOpen(true);
    };

    const handleLogout = async () => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            console.log('🚪 Logout clicked');
            setIsMenuOpen(false);
            const success = await logout();
            if (success) {
                console.log('✅ Logout successful - App.js will handle navigation automatically');
                // Navigation happens automatically via App.js when user becomes null
            }
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
                console.log('👤 Profile pressed - navigating to Profile');
                navigation.navigate('Profile');
            }
        },
        {
            icon: Settings,
            label: 'Settings',
            onPress: () => {
                setIsMenuOpen(false);
                console.log('⚙️ Settings pressed - navigating to Settings');
                navigation.navigate('Settings');
            }
        },
        {
            icon: HelpCircle,
            label: 'Help',
            onPress: () => {
                setIsMenuOpen(false);
                console.log('❓ Help pressed - navigating to Help');
                navigation.navigate('Help');
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
            <View style={[styles.header, { paddingTop: insets.top, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <View style={styles.headerContent}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>Heavenly Hub</Text>
                    <TouchableOpacity onPress={handleMenuPress} style={styles.menuButton}>
                        <Menu size={24} color={colors.textPrimary} />
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
                    style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}
                    onPress={() => setIsMenuOpen(false)}
                >
                    <View style={styles.menuContainer}>
                        <View style={[styles.menuContent, { backgroundColor: colors.surface }]}>
                            {menuItems.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={item.onPress}
                                    style={[
                                        styles.menuItem,
                                        index !== menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                                        item.destructive && styles.destructiveItem
                                    ]}
                                >
                                    <item.icon size={20} color={item.destructive ? colors.error : colors.textPrimary} />
                                    <Text style={[
                                        styles.menuItemText,
                                        { color: item.destructive ? colors.error : colors.textPrimary }
                                    ]}>
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

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
    },
    menuButton: {
        padding: 4,
    },
    modalOverlay: {
        flex: 1,
    },
    menuContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 80,
        paddingRight: 16,
    },
    menuContent: {
        borderRadius: 8,
        minWidth: 200,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    menuItemText: {
        marginLeft: 12,
        fontSize: 16,
        fontWeight: '500',
    },
    destructiveItem: {
        // Could add special background color if needed
    },
});

export default AppHeader;
