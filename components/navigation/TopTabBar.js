import React from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import PressableWithFeedback from '../../src/components/feedback/PressableWithFeedback';

function TopTabBar({ activeTab, onTabChange }) {
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
        backgroundColor: '#F3F4F6',
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
              backgroundColor: 'white'
            },
            indicatorStyle,
          ]}
        />
        {tabs.map((tab) => (
          <PressableWithFeedback
            key={tab.id}
            onPress={() => handleTabPress(tab.id)}
            style={{ 
              width: tabWidth,
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%'
            }}
            hapticType="selection"
            scaleValue={0.98}
          >
            <Text 
              style={{ 
                fontSize: 16,
                fontWeight: '500',
                zIndex: 10,
                color: activeTab === tab.id ? '#000000' : '#6B7280'
              }}
            >
              {tab.label}
            </Text>
          </PressableWithFeedback>
        ))}
      </View>
    </View>
  );
}

export default TopTabBar;