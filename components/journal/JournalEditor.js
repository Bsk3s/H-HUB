import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Animated,
    StyleSheet,
    Alert,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const JournalEditor = ({ isVisible, onClose, onSave, cardData, isNewReflection = false, existingJournal = null }) => {
    const [journalText, setJournalText] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        if (isVisible) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 65,
                    friction: 8,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            scaleAnim.setValue(0.9);
            opacityAnim.setValue(0);
            setJournalText(''); // Reset on close
        }
    }, [isVisible]);

    const handleSave = async () => {
        if (!journalText.trim()) {
            Alert.alert('Empty Journal', 'Please write something before saving.');
            return;
        }

        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setIsSaving(true);

            // Create journal entry with auto-tagging
            const journalEntry = {
                id: Date.now().toString(),
                title: cardData?.title || 'Journal Entry',
                content: journalText,
                pillar: cardData?.pillar || 'Faith',
                scripture: cardData?.scripture || '',
                scriptureRef: cardData?.scriptureRef || '',
                reflection: cardData?.reflection || '',
                cardId: cardData?.id || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            console.log('📝 Saving journal entry:', journalEntry, 'isNewReflection:', isNewReflection);
            await onSave(journalEntry, isNewReflection);

            setIsSaving(false);
            setJournalText('');
            onClose();

            // Show success feedback
            setTimeout(() => {
                const message = isNewReflection
                    ? 'New reflection added to your journal!'
                    : `Your reflection has been saved to ${cardData?.pillar || 'Faith'}.`;
                Alert.alert('✅ Saved!', message, [{ text: 'OK' }]);
            }, 300);
        } catch (error) {
            console.error('❌ Error saving journal:', error);
            setIsSaving(false);
            Alert.alert('Error', 'Failed to save journal. Please try again.');
        }
    };

    const handleClose = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onClose();
    };

    if (!cardData) return null;

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={isVisible}
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <Animated.View
                    style={[
                        styles.backdrop,
                        { opacity: opacityAnim }
                    ]}
                >
                    <TouchableOpacity
                        style={styles.backdropTouchable}
                        activeOpacity={1}
                        onPress={handleClose}
                    />
                </Animated.View>

                <Animated.View
                    style={[
                        styles.modalContainer,
                        {
                            opacity: opacityAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <X size={24} color="#6b7280" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Journal Entry</Text>
                        <TouchableOpacity
                            onPress={handleSave}
                            style={[
                                styles.saveButton,
                                (!journalText.trim() || isSaving) && styles.saveButtonDisabled
                            ]}
                            disabled={!journalText.trim() || isSaving}
                        >
                            <Check size={24} color={journalText.trim() && !isSaving ? '#6B46C1' : '#d1d5db'} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.contentScroll}
                        contentContainerStyle={styles.contentContainer}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Card Title */}
                        <View style={styles.section}>
                            <Text style={styles.titleText}>{cardData.title}</Text>
                        </View>

                        {/* Scripture Block */}
                        <View style={styles.scriptureBlock}>
                            <Text style={styles.scriptureIcon}>📖</Text>
                            <View style={styles.scriptureContent}>
                                <Text style={styles.scriptureRef}>{cardData.scriptureRef}</Text>
                                <Text style={styles.scriptureText}>"{cardData.scripture}"</Text>
                            </View>
                        </View>

                        {/* Original Reflection */}
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>💭 REFLECTION</Text>
                            <Text style={styles.reflectionText}>{cardData.reflection}</Text>
                        </View>

                        {/* Divider */}
                        <View style={styles.divider} />

                        {/* Journal Prompts */}
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>✍️ MY THOUGHTS</Text>
                            <View style={styles.promptsContainer}>
                                <Text style={styles.promptText}>• How does this resonate with me right now?</Text>
                                <Text style={styles.promptText}>• What is God teaching me through this season?</Text>
                                <Text style={styles.promptText}>• What's one small step I can take today?</Text>
                            </View>
                        </View>

                        {/* Text Input */}
                        <TextInput
                            style={styles.textInput}
                            multiline
                            placeholder="Start writing..."
                            placeholderTextColor="#9ca3af"
                            value={journalText}
                            onChangeText={setJournalText}
                            autoFocus={false}
                            textAlignVertical="top"
                        />

                        {/* Auto-tag indicator */}
                        <View style={styles.autoTagContainer}>
                            <Text style={styles.autoTagText}>
                                Auto-tagged: <Text style={styles.autoTagPillar}>{cardData.pillar}</Text>
                            </Text>
                        </View>
                    </ScrollView>
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    backdropTouchable: {
        flex: 1,
    },
    modalContainer: {
        flex: 1,
        marginHorizontal: 16,
        marginVertical: 60,
        borderRadius: 24,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.25,
        shadowRadius: 25,
        elevation: 10,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    closeButton: {
        padding: 4,
    },
    saveButton: {
        padding: 4,
    },
    saveButtonDisabled: {
        opacity: 0.4,
    },
    contentScroll: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    titleText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        lineHeight: 32,
    },
    scriptureBlock: {
        flexDirection: 'row',
        backgroundColor: '#f9fafb',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    scriptureIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    scriptureContent: {
        flex: 1,
    },
    scriptureRef: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: 8,
    },
    scriptureText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
        lineHeight: 24,
        fontStyle: 'italic',
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6b7280',
        letterSpacing: 1,
        marginBottom: 12,
    },
    reflectionText: {
        fontSize: 16,
        color: '#374151',
        lineHeight: 24,
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginVertical: 24,
    },
    promptsContainer: {
        gap: 8,
    },
    promptText: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 20,
    },
    textInput: {
        minHeight: 200,
        fontSize: 16,
        color: '#111827',
        lineHeight: 24,
        padding: 16,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginTop: 16,
    },
    autoTagContainer: {
        marginTop: 16,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    autoTagText: {
        fontSize: 12,
        color: '#6b7280',
    },
    autoTagPillar: {
        fontWeight: '700',
        color: '#6B46C1',
    },
});

export default JournalEditor;

