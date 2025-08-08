import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import VirusProofTopTabs from './VirusProofTopTabs';
import { theme } from '../../../theme';

// Example tab content components
const SpiritualTab = () => (
  <ScrollView style={styles.tabContent}>
    <View style={styles.contentContainer}>
      <Text style={styles.tabTitle}>Spiritual Growth</Text>
      <Text style={styles.tabDescription}>
        Connect with AI spiritual guides and explore your faith journey.
      </Text>
    </View>
  </ScrollView>
);

const StudyTab = () => (
  <ScrollView style={styles.tabContent}>
    <View style={styles.contentContainer}>
      <Text style={styles.tabTitle}>Bible Study</Text>
      <Text style={styles.tabDescription}>
        Interactive Bible study tools and guided learning experiences.
      </Text>
    </View>
  </ScrollView>
);

const CommunityTab = () => (
  <ScrollView style={styles.tabContent}>
    <View style={styles.contentContainer}>
      <Text style={styles.tabTitle}>Community</Text>
      <Text style={styles.tabDescription}>
        Connect with fellow believers and share your spiritual journey.
      </Text>
    </View>
  </ScrollView>
);

const TopTabsExample = () => {
  // Define the routes for the tabs
  const routes = [
    { key: 'spiritual', title: 'Spiritual' },
    { key: 'study', title: 'Study' },
    { key: 'community', title: 'Community' },
  ];

  // Define which component to render for each route
  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'spiritual':
        return <SpiritualTab />;
      case 'study':
        return <StudyTab />;
      case 'community':
        return <CommunityTab />;
      default:
        return null;
    }
  };

  const handleTabChange = (index) => {
    console.log(`🔄 Tab changed to: ${routes[index].title} (index: ${index})`);
  };

  return (
    <View style={styles.container}>
      <VirusProofTopTabs
        routes={routes}
        renderScene={renderScene}
        initialTabIndex={0}
        onTabChange={handleTabChange}
        tabBarStyle={styles.customTabBar}
        tabBarLabelStyle={styles.customLabel}
        tabBarIndicatorStyle={styles.customIndicator}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabContent: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.large,
    alignItems: 'center',
  },
  tabTitle: {
    ...theme.typography.heading,
    color: theme.colors.primary,
    marginBottom: theme.spacing.medium,
    textAlign: 'center',
  },
  tabDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  // Custom tab bar styling
  customTabBar: {
    backgroundColor: theme.colors.backgroundLight,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primaryLight + '30',
  },
  customLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  customIndicator: {
    backgroundColor: theme.colors.accent,
    height: 4,
  },
});

export default TopTabsExample;