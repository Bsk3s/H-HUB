import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Heart } from 'lucide-react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

/*
 * Daily Verse Component
 * 
 * ✅ CONNECTED: Now uses dailyVerseService.js for rotating daily verses
 * 
 * TODO for Engineers:
 * 1. ✅ Connect to dailyVerseService.js ✅ DONE
 * 2. ✅ Replace hardcoded verse ✅ DONE  
 * 3. ✅ Daily rotation from 365 verses ✅ DONE
 * 4. ✅ Keep beautiful card design ✅ DONE
 * 5. 🚀 RE-ADD SHARING FEATURE - Users want to share daily verses!
 *    - Add back share icon (top-right)
 *    - Implement image generation for sharing
 *    - Include social media integration (Instagram Stories, etc.)
 * 
 * Goal: Create an inspiring daily Bible verse experience that users love
 * to check every day, with smooth animations and beautiful typography.
 */

import dailyVerseService from '../../src/services/dailyVerseService';

const DailyVerse = () => {
  const [liked, setLiked] = useState(false);
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);

  const storageKey = `dailyVerseLiked:${new Date().toISOString().slice(0, 10)}`; // per-day like

  useEffect(() => {
    (async () => {
      try {
        const v = await AsyncStorage.getItem(storageKey);
        if (v === '1') setLiked(true);
      } catch {}
    })();
  }, []);

  // Load today's verse from the service
  useEffect(() => {
    const loadTodaysVerse = async () => {
      try {
        setLoading(true);
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

  const toggleLike = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const next = !liked;
      setLiked(next);
      await AsyncStorage.setItem(storageKey, next ? '1' : '0');
    } catch {}
  };

  // Split verse body and reference if formatted like: "..." - Ref
  const { bodyText, referenceText } = useMemo(() => {
    if (!verse) return { bodyText: '', referenceText: '' };
    
    // Use the verse text and reference from the daily verse service
    const verseText = verse.text;
    const verseRef = verse.verse;
    const version = verse.version || 'NKJV';
    
    return { 
      bodyText: `"${verseText}"`, 
      referenceText: `${verseRef} ${version}` 
    };
  }, [verse]);

  // Show loading state
  if (loading || !verse) {
    return (
      <View style={{
        paddingTop: 18,
        paddingBottom: 28,
        paddingHorizontal: 22,
        backgroundColor: '#f8f9fa',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 3,
      }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 8, letterSpacing: 0.7 }}>DAILY VERSE</Text>
        <Text style={{ fontSize: 18, color: '#9CA3AF' }}>Loading today's verse...</Text>
      </View>
    );
  }

  // Dense poster dynamic typography
  const bodyLen = bodyText.length;
  const quoteFontSize = bodyLen < 70 ? 26 : bodyLen < 120 ? 24 : 22;
  const quoteLineHeight = bodyLen < 70 ? 36 : bodyLen < 120 ? 34 : 32;


  return (
    <View
      style={{
        paddingTop: 18,
        paddingBottom: 28,
        paddingHorizontal: 22,
        backgroundColor: '#f8f9fa',
        borderRadius: 20,
        position: 'relative',
        // content-driven height
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* Frame removed for cleaner edge */}

      {/* Subtle radial highlight behind the quote */}
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, pointerEvents: 'none' }}>
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient id="verseGlow" cx="30%" cy="35%" rx="60%" ry="50%">
              <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.03" />
              <Stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#verseGlow)" />
        </Svg>
      </View>



      <Text style={{ fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 8, letterSpacing: 0.7 }}>DAILY VERSE</Text>
      <Text style={{ fontSize: quoteFontSize, color: '#111827', lineHeight: quoteLineHeight }}>{bodyText}</Text>
      {!!referenceText && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
          <Text style={{ fontSize: 14, color: '#6B7280' }}>— {referenceText.split(' ')[0]} {referenceText.split(' ')[1]}</Text>
          <View
            style={{
              marginLeft: 8,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: '#F1F5F9',
            }}
          >
            <Text style={{ fontSize: 12, color: '#475569', fontWeight: '600' }}>{referenceText.split(' ')[2] || 'NKJV'}</Text>
          </View>
        </View>
      )}

      {/* Bottom-right heart button */}
      <TouchableOpacity
        onPress={toggleLike}
        style={{
          position: 'absolute',
          right: 14,
          bottom: 14,
        }}
        accessibilityRole="button"
        accessibilityLabel="Like daily verse"
        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
      >
        <Heart
          size={24}
          color={liked ? '#DC2626' : '#9CA3AF'}
          fill={liked ? '#DC2626' : 'transparent'}
          strokeWidth={2}
        />
      </TouchableOpacity>
    </View>
  );
};

export default DailyVerse;