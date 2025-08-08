import React from 'react';
import { View, Text } from 'react-native';

const DailyVerse = () => {
  return (
    <View style={{ padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Daily Verse</Text>
      <Text style={{ fontSize: 14, color: '#666' }}>
        "Trust in the Lord with all your heart..." - Proverbs 3:5
      </Text>
    </View>
  );
};

export default DailyVerse;