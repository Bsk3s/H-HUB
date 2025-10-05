import React from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../src/hooks/useTheme';

function TopTabBar({ activeTab, onTabChange, voiceChatActive = false }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const tabs = [
    { id: 'Chat', label: 'Chat' },
    { id: 'Home', label: 'Home' },
    { id: 'Bible', label: 'Bible' },
    { id: 'Study', label: 'Study' }
  ];

  const contentWidth = width - 32; // 16px padding on each side
  const tabWidth = contentWidth / tabs.length;

  const handleTabPress = async (tabId) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTabChange(tabId);
  };

  const indicatorStyle = useAnimatedStyle(() => {
    const index = tabs.findIndex(tab => tab.id === activeTab);
    return {
      transform: [{ translateX: withSpring(index * tabWidth, { damping: 15 }) }],
    };
  });

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
      <View style={{
        backgroundColor: colors.backgroundSecondary,
        borderRadius: 9999, // Full rounded like HB1
        height: 45,
        flexDirection: 'row',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Animated.View
          style={[
            {
              width: tabWidth,
              position: 'absolute',
              height: 36,
              top: 4.5,
              borderRadius: 9999, // Full rounded
              backgroundColor: colors.surface
            },
            indicatorStyle,
          ]}
        />
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => handleTabPress(tab.id)}
            style={{
              width: tabWidth,
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%'
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', zIndex: 10 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: activeTab === tab.id ? colors.textPrimary : colors.textSecondary
                }}
              >
                {tab.label}
              </Text>
              {/* Voice chat indicator for Chat tab */}
              {tab.id === 'Chat' && voiceChatActive && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: colors.success,
                    marginLeft: 6,
                  }}
                />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default TopTabBar;