import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Linking, Image, Alert, Share as RNShare } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Heart } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

const DailyVerse = () => {
  const [liked, setLiked] = useState(false);

  const storageKey = `dailyVerseLiked:${new Date().toISOString().slice(0, 10)}`; // per-day like

  useEffect(() => {
    (async () => {
      try {
        const v = await AsyncStorage.getItem(storageKey);
        if (v === '1') setLiked(true);
      } catch {}
    })();
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
    const raw = '"Trust in the Lord with all your heart..." - Proverbs 3:5';
    const idx = raw.lastIndexOf(' - ');
    if (idx > -1) {
      return { bodyText: raw.slice(0, idx), referenceText: raw.slice(idx + 3) };
    }
    return { bodyText: raw, referenceText: '' };
  }, []);

  // Version pill (until version selection is wired)
  const versionText = 'NKJV';
  // Dense poster dynamic typography
  const bodyLen = bodyText.length;
  const quoteFontSize = bodyLen < 70 ? 26 : bodyLen < 120 ? 24 : 22;
  const quoteLineHeight = bodyLen < 70 ? 36 : bodyLen < 120 ? 34 : 32;
  const cardRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleShare = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsExporting(true);
      await new Promise(r => setTimeout(r, 60));
      const target = cardRef.current || cardRef; // ensure we pass a native ref
      const uri = await captureRef(target, { format: 'png', quality: 1, result: 'tmpfile' });

      // Primary: React Native share (guaranteed to show UI)
      try {
        await RNShare.share({ url: uri, message: 'Daily Verse' });
      } catch {}

      // Secondary: Expo Sharing (if available)
      try {
        const sharingAvailable = await Sharing.isAvailableAsync();
        if (sharingAvailable) {
          await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share Daily Verse' });
        }
      } catch {}

      // Tertiary: Instagram Stories attempt (best-effort)
      try {
        const igScheme = Platform.OS === 'ios' ? 'instagram-stories://share' : 'https://www.instagram.com';
        const canIG = await Linking.canOpenURL(igScheme);
        if (canIG && Clipboard?.setImageAsync && Platform.OS === 'ios') {
          const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
          await Clipboard.setImageAsync(`data:image/png;base64,${base64}`);
          await Linking.openURL('instagram-stories://share');
        }
      } catch {}
    } catch (e) {
      try {
        Alert.alert('Share failed', typeof e?.message === 'string' ? e.message : 'Unable to share.');
      } catch {}
    }
    finally {
      setIsExporting(false);
    }
  };

  return (
    <View
      ref={cardRef}
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

      {/* Share icon (top-right) - hidden during export */}
      {!isExporting && (
        <TouchableOpacity
          onPress={handleShare}
          accessibilityRole="button"
          accessibilityLabel="Share daily verse"
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          style={{ position: 'absolute', top: 14, right: 14 }}
        >
          <Ionicons name={Platform.OS === 'ios' ? 'ios-share-outline' : 'share-outline'} size={20} color="#A0AEC0" />
        </TouchableOpacity>
      )}

      <Text style={{ fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 8, letterSpacing: 0.7 }}>DAILY VERSE</Text>
      <Text style={{ fontSize: quoteFontSize, color: '#111827', lineHeight: quoteLineHeight }}>{bodyText}</Text>
      {!!referenceText && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
          <Text style={{ fontSize: 14, color: '#6B7280' }}>— {referenceText}</Text>
          <View
            style={{
              marginLeft: 8,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: '#F1F5F9',
            }}
          >
            <Text style={{ fontSize: 12, color: '#475569', fontWeight: '600' }}>{versionText}</Text>
          </View>
        </View>
      )}

      {/* Bottom-right heart button (hidden during export) */}
      {!isExporting && (
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
      )}

      {/* Watermark (export-only) */}
      {isExporting && (
        <View style={{ position: 'absolute', bottom: 18, left: 0, right: 0, alignItems: 'center' }}>
          <Image
            source={require('../../assets/branding/HBMAIN1.png')}
            resizeMode="contain"
            style={{ width: 220, height: 60, opacity: 0.6 }}
          />
        </View>
      )}
    </View>
  );
};

export default DailyVerse;