import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions, Animated } from 'react-native';

// Simple top tab bar with smooth animations (virus-proof)
function TopTabBar({ activeTab, onTabChange }) {
  const { width } = useWindowDimensions();
  
  const tabs = [
    { key: 'Chat', label: 'Chat' },
    { key: 'Home', label: 'Home' },
    { key: 'Bible', label: 'Bible' },
    { key: 'Study', label: 'Study' }
  ];

  const contentWidth = width - 32; // Account for padding
  const tabWidth = contentWidth / tabs.length;
  
  // Animation ref for smooth indicator movement
  const indicatorPosition = useRef(new Animated.Value(0)).current;
  
  // Animate indicator when active tab changes
  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.key === activeTab);
    Animated.spring(indicatorPosition, {
      toValue: activeIndex * tabWidth + 2,
      useNativeDriver: false, // We're animating layout properties
      tension: 120,
      friction: 8
    }).start();
  }, [activeTab, tabWidth]);

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
      <View style={{
        backgroundColor: '#F3F4F6',
        borderRadius: 22,
        height: 45,
        flexDirection: 'row',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Indicator - smooth movement */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 2,
            height: 41,
            width: tabWidth - 4,
            backgroundColor: 'white',
            borderRadius: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            left: indicatorPosition
          }}
        />
        
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              height: 45,
              zIndex: 1
            }}
          >
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              lineHeight: 20,
              color: activeTab === tab.key ? '#1F2937' : '#6B7280'
            }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default TopTabBar;