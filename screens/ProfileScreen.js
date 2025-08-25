import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import BackButton from '../components/ui/BackButton';
import { useAuth } from '../src/auth/context';
// TODO: Import these services when we implement them
// import { getUserProfile } from '../src/auth/services/profile-service';
// import { getCompleteUserProfile, migrateAsyncStorageToDatabase } from '../src/auth/services/onboarding-service';

export default function ProfileScreen({ navigation }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    currentStreak: 0,
    bestStreak: 0,
    totalDays: 0,
  });
  const [spiritualData, setSpiritualData] = useState({
    denomination: null,
    spiritualJourney: null,
    faithChallenges: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchProfileData();
    }
  }, [user?.id]);

  const fetchProfileData = async () => {
    try {
      // TODO: Implement actual profile data fetching
      // For now, use mock data
      setProfile({
        name: user?.email?.split('@')[0] || 'User',
        age: null,
        role: null,
        speech_time: null
      });

      setSpiritualData({
        denomination: { label: 'Non-Denominational' },
        spiritualJourney: { id: 2 },
        faithChallenges: [],
      });

      setStats({
        currentStreak: 5,
        bestStreak: 12,
        totalDays: 45,
      });

    } catch (error) {
      console.error('Error fetching profile data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (navigation.goBack) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  const handleEditProfile = () => {
    console.log('📝 Edit Profile pressed - navigating to EditProfile');
    navigation.navigate('EditProfile');
  };

  const handleChangePassword = () => {
    console.log('🔒 Change Password pressed - navigating to ChangePassword');
    navigation.navigate('ChangePassword');
  };

  const handleAccountSettings = () => {
    console.log('⚙️ Account Settings pressed - navigating to Settings');
    navigation.navigate('Settings');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getMemberSince = () => {
    if (user?.created_at) {
      return formatDate(user.created_at);
    }
    return 'Recently joined';
  };

  const getSpiritualJourneyText = (journey) => {
    if (!journey) return 'Not set';
    
    const journeyTexts = {
      1: "Exploring faith and looking for guidance",
      2: "Believe in God but struggle to stay consistent",
      3: "Actively growing but want deeper understanding",
      4: "Have strong faith and want to stay spiritually sharp",
    };
    
    return journeyTexts[journey.id] || 'Not set';
  };

  const getFaithChallengesText = (challenges) => {
    if (!challenges || challenges.length === 0) return 'None selected';
    
    const challengeTexts = {
      1: "Finding time to read the Bible consistently",
      2: "Understanding scripture in a way that applies to life",
      3: "Lacking a supportive faith-based community",
      4: "Feeling distant from God or struggling to hear His voice",
      5: "Not knowing where to start when studying the Bible",
    };
    
    return challenges.map(c => challengeTexts[c.id] || 'Unknown').join(', ');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={handleBack} />
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Profile Header Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {(profile?.name || user?.email || 'U')[0].toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {profile?.name || user?.email?.split('@')[0] || 'User'}
              </Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              <Text style={styles.memberSince}>
                Member since {getMemberSince()}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={handleEditProfile}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>✏️ Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Spiritual Identity Section */}
        <View style={styles.spiritualSection}>
          <Text style={styles.sectionTitle}>Spiritual Identity</Text>
          
          <View style={styles.spiritualItem}>
            <Text style={styles.spiritualLabel}>Denomination</Text>
            <Text style={styles.spiritualValue}>
              {spiritualData.denomination?.label || 'Not set'}
            </Text>
          </View>
          
          <View style={styles.spiritualItem}>
            <Text style={styles.spiritualLabel}>Spiritual Journey</Text>
            <Text style={styles.spiritualValue}>
              {getSpiritualJourneyText(spiritualData.spiritualJourney)}
            </Text>
          </View>
          
          <View style={styles.spiritualItem}>
            <Text style={styles.spiritualLabel}>Faith Challenges</Text>
            <Text style={styles.spiritualValue}>
              {getFaithChallengesText(spiritualData.faithChallenges)}
            </Text>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, styles.orangeIcon]}>
                <Text style={styles.statIconText}>🏆</Text>
              </View>
              <Text style={styles.statNumber}>{stats.currentStreak}</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIcon, styles.yellowIcon]}>
                <Text style={styles.statIconText}>🥇</Text>
              </View>
              <Text style={styles.statNumber}>{stats.bestStreak}</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIcon, styles.greenIcon]}>
                <Text style={styles.statIconText}>📅</Text>
              </View>
              <Text style={styles.statNumber}>{stats.totalDays}</Text>
              <Text style={styles.statLabel}>Total Days</Text>
            </View>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.accountSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity 
            onPress={handleChangePassword}
            style={styles.accountItem}
          >
            <View style={styles.accountLeft}>
              <Text style={styles.accountIcon}>🔒</Text>
              <Text style={styles.accountText}>Change Password</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          
          <View style={styles.accountItem}>
            <Text style={styles.accountLabel}>Connected Accounts</Text>
            <Text style={styles.accountValue}>
              {user?.app_metadata?.provider ? 
                (user.app_metadata.provider === 'email' ? 'Email' : user.app_metadata.provider.charAt(0).toUpperCase() + user.app_metadata.provider.slice(1))
                : 'Email'}
            </Text>
          </View>
          
          <TouchableOpacity 
            onPress={handleAccountSettings}
            style={styles.accountItem}
          >
            <Text style={styles.accountText}>Account Settings</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    padding: 24,
    backgroundColor: '#F9FAFB',
    margin: 16,
    borderRadius: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#DDD6FE',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  profileEmail: {
    color: '#6B7280',
    marginTop: 4,
  },
  memberSince: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 4,
  },
  editButton: {
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#374151',
    fontWeight: '500',
  },
  spiritualSection: {
    padding: 24,
    backgroundColor: '#EFF6FF',
    margin: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  spiritualItem: {
    marginBottom: 12,
  },
  spiritualLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  spiritualValue: {
    color: '#111827',
    marginTop: 4,
  },
  achievementsSection: {
    padding: 24,
    backgroundColor: '#FFFBEB',
    margin: 16,
    borderRadius: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  orangeIcon: {
    backgroundColor: '#FDEDD4',
  },
  yellowIcon: {
    backgroundColor: '#FEF3C7',
  },
  greenIcon: {
    backgroundColor: '#D1FAE5',
  },
  statIconText: {
    fontSize: 24,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  accountSection: {
    padding: 24,
    backgroundColor: '#F9FAFB',
    margin: 16,
    marginBottom: 24,
    borderRadius: 12,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 12,
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  accountText: {
    color: '#111827',
  },
  accountLabel: {
    color: '#374151',
    fontWeight: '500',
    marginBottom: 8,
  },
  accountValue: {
    color: '#6B7280',
  },
  chevron: {
    fontSize: 16,
    color: '#9CA3AF',
  },
});
