import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Heart, MessageCircle, BookOpen, Bookmark, Star, Send } from 'lucide-react-native';

const { height } = Dimensions.get('window');

const RealStuffModal = ({ card, isVisible, onClose }) => {
  if (!card) return null;

  const getGradientColors = () => {
    switch (card.color) {
      case 'indigo':
        return ['#a5b4fc', '#8b5cf6', '#6366f1'];
      case 'rose':
        return ['#fda4af', '#f472b6', '#fdba74'];
      case 'teal':
        return ['#7dd3fc', '#06b6d4', '#67e8f9'];
      case 'clay':
        return ['#fdba74', '#f472b6', '#fda4af'];
      default:
        return ['#cbd5e1', '#94a3b8', '#64748b'];
    }
  };

  const getPillarEmoji = () => {
    switch (card.pillar) {
      case 'Faith':
        return '✝️';
      case 'Love':
        return '💕';
      case 'Relationships':
        return '🤝';
      case 'Lust':
        return '🔥';
      default:
        return '✝️';
    }
  };

  const handleAction = (action) => {
    // TODO: Implement action handling
    console.log('Action pressed:', action);
    // These would connect to actual app functionality
  };

  const getActionIcon = (action) => {
    if (action.includes('God') || action.includes('Fresh') || action.includes('Peace') || action.includes('Heart')) {
      return <Heart size={20} color="#6b7280" />;
    } else if (action.includes('Adina')) {
      return <MessageCircle size={20} color="#6b7280" />;
    } else {
      return <Star size={20} color="#6b7280" />;
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        {/* Backdrop - tap to close */}
        <TouchableOpacity 
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />
        
        {/* Modal Content */}
        <View 
          style={{ 
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: height * 0.85,
            minHeight: height * 0.60
          }}
        >
          {/* Header with gradient */}
          <LinearGradient
            colors={getGradientColors()}
            style={{
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: 28
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: 'white', fontSize: 18, marginRight: 12 }}>
                  {getPillarEmoji()}
                </Text>
                <Text style={{ 
                  color: 'rgba(255, 255, 255, 0.9)', 
                  fontSize: 12, 
                  fontWeight: '600', 
                  letterSpacing: 1.2 
                }}>
                  {card.pillar.toUpperCase()}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={onClose} 
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.25)', 
                  borderRadius: 20, 
                  padding: 8 
                }}
              >
                <X size={18} color="white" />
              </TouchableOpacity>
            </View>
            
            <Text style={{ 
              color: 'white', 
              fontSize: 20, 
              fontWeight: 'bold', 
              lineHeight: 24, 
              marginBottom: 12,
              letterSpacing: -0.3
            }}>
              {card.title}
            </Text>
            <Text style={{
              color: 'rgba(255, 255, 255, 0.95)',
              fontSize: 14,
              lineHeight: 20,
              fontWeight: '400'
            }}>
              {card.subtext}
            </Text>
          </LinearGradient>

          <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Scripture Section */}
            <View style={{ marginBottom: 28 }}>
              <Text style={{ 
                color: '#6b7280', 
                fontSize: 12, 
                fontWeight: '600', 
                letterSpacing: 1, 
                marginBottom: 12 
              }}>
                SCRIPTURE
              </Text>
              <View style={{ 
                backgroundColor: '#f9fafb', 
                borderRadius: 16, 
                padding: 20 
              }}>
                <Text style={{
                  color: '#111827',
                  fontSize: 18,
                  fontWeight: '500',
                  textAlign: 'center',
                  lineHeight: 24,
                  marginBottom: 8
                }}>
                  "{card.scripture}"
                </Text>
                <Text style={{
                  color: '#6b7280',
                  fontSize: 14,
                  textAlign: 'center',
                  fontWeight: '500'
                }}>
                  {card.scriptureRef}
                </Text>
              </View>
            </View>

            {/* Reflection Section */}
            <View style={{ marginBottom: 28 }}>
              <Text style={{ 
                color: '#6b7280', 
                fontSize: 12, 
                fontWeight: '600', 
                letterSpacing: 1, 
                marginBottom: 12 
              }}>
                REFLECTION
              </Text>
              <Text style={{
                color: '#374151',
                fontSize: 16,
                lineHeight: 22,
                fontWeight: '400'
              }}>
                {card.reflection}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={{ gap: 12 }}>
              {card.actions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleAction(action)}
                  style={{
                    backgroundColor: '#f9fafb',
                    borderRadius: 12,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#f3f4f6',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1
                  }}
                >
                  <View style={{ marginRight: 16 }}>
                    {getActionIcon(action)}
                  </View>
                  <Text style={{
                    color: '#374151',
                    fontWeight: '500',
                    fontSize: 16,
                    flex: 1
                  }}>
                    {action}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Bottom Spacing */}
            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default RealStuffModal; 