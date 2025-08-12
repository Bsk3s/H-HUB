import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import dailyVerseService from '../../../src/services/dailyVerseService';

const DailyVerse = () => {
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTodaysVerse = async () => {
      try {
        const todaysVerse = await dailyVerseService.getTodaysVerse();
        setVerse(todaysVerse);
      } catch (error) {
        console.error('Error loading daily verse:', error);
        // Fallback verse
        setVerse({
          text: "And we have known and believed the love that God has for us. God is love, and he who abides in love abides in God, and God in him.",
          verse: "1 John 4:16",
          version: "NKJV"
        });
      } finally {
        setLoading(false);
      }
    };

    loadTodaysVerse();
  }, []);

  if (loading || !verse) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Daily Verse</Text>
        <Text style={styles.loadingText}>Loading today's verse...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Verse</Text>
      <Text style={styles.verseText}>
        "{verse.text}"
      </Text>
      <Text style={styles.reference}>{verse.verse} {verse.version}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0fdf4', // bg-green-50
    borderRadius: 12, // rounded-xl
    paddingVertical: 16, // py-4
    paddingHorizontal: 20, // px-5
  },
  title: {
    fontSize: 14, // text-sm
    fontWeight: '500', // font-medium
    color: '#166534', // text-green-800
    marginBottom: 8, // mb-2
  },
  verseText: {
    fontSize: 18, // text-lg
    color: '#1f2937', // text-gray-800
    marginBottom: 8, // mb-2
  },
  loadingText: {
    fontSize: 18, // text-lg
    color: '#9ca3af', // text-gray-400
  },
  reference: {
    fontSize: 14, // text-sm
    color: '#4b5563', // text-gray-600
  },
});

export default DailyVerse;
