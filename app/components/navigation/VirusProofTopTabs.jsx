import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { theme } from '../../../theme';

const VirusProofTopTabs = ({ 
  routes, 
  renderScene, 
  initialTabIndex = 0,
  tabBarStyle = {},
  tabBarLabelStyle = {},
  tabBarIndicatorStyle = {},
  onTabChange = () => {}
}) => {
  const [index, setIndex] = useState(initialTabIndex);
  
  const handleIndexChange = (newIndex) => {
    setIndex(newIndex);
    onTabChange(newIndex);
  };

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={[styles.indicator, tabBarIndicatorStyle]}
      style={[styles.tabBar, tabBarStyle]}
      labelStyle={[styles.label, tabBarLabelStyle]}
      activeColor={theme.colors.primary}
      inactiveColor={theme.colors.textSecondary}
      pressColor={theme.colors.primaryLight + '20'} // 20% opacity
      android_ripple={{ borderless: false }}
    />
  );

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={handleIndexChange}
        initialLayout={{ width: Dimensions.get('window').width }}
        swipeEnabled={true}
        animationEnabled={true}
        style={styles.tabView}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabView: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: theme.colors.background,
    elevation: 0, // Remove shadow on Android
    shadowOpacity: 0, // Remove shadow on iOS
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  indicator: {
    backgroundColor: theme.colors.primary,
    height: 3,
    borderRadius: 1.5,
  },
  label: {
    ...theme.typography.tabLabel,
    textTransform: 'none', // Preserve original case
    fontWeight: '600',
  },
});

export default VirusProofTopTabs;