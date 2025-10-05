import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    SafeAreaView,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { updateJournalEntry, deleteJournalEntry } from '../../services/journalService';
import * as Haptics from 'expo-haptics';

// Helper function to format dates
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
};

export default function JournalDetailScreen({ route, navigation }) {
    const { journal } = route.params;
    const [isEditing, setIsEditing] = useState(false);
    const [editingReflectionId, setEditingReflectionId] = useState(null);
    const [editedContent, setEditedContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Get all reflections (support both old and new format)
    const reflections = journal.reflections || [{
        id: journal.id,
        content: journal.content,
        date: journal.createdAt,
    }];

    const handleSave = async () => {
        if (!editedContent.trim()) {
            Alert.alert('Empty Content', 'Please write something before saving.');
            return;
        }

        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setIsSaving(true);

            await updateJournalEntry(journal.id, { content: editedContent });

            setIsEditing(false);
            setIsSaving(false);

            Alert.alert('✅ Saved', 'Your journal has been updated.');
        } catch (error) {
            console.error('Error saving journal:', error);
            setIsSaving(false);
            Alert.alert('Error', 'Failed to save journal. Please try again.');
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Journal',
            'Are you sure you want to delete this journal entry?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteJournalEntry(journal.id);
                            navigation.goBack();
                            Alert.alert('Deleted', 'Journal entry has been deleted.');
                        } catch (error) {
                            console.error('Error deleting journal:', error);
                            Alert.alert('Error', 'Failed to delete journal.');
                        }
                    }
                }
            ]
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { month: 'long', day: 'numeric', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const getPillarEmoji = (pillar) => {
        const emojiMap = {
            Faith: '✝️',
            Hope: '💙',
            Prayer: '🙏',
            Love: '❤️',
        };
        return emojiMap[pillar] || '✝️';
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="chevron-left" size={24} color="#000" />
                </TouchableOpacity>

                <View style={styles.headerActions}>
                    {isEditing ? (
                        <>
                            <TouchableOpacity
                                onPress={() => {
                                    setEditedContent(journal.content);
                                    setIsEditing(false);
                                }}
                                style={styles.headerButton}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSave}
                                style={[styles.headerButton, styles.saveButton]}
                                disabled={isSaving}
                            >
                                <Text style={styles.saveText}>{isSaving ? 'Saving...' : 'Save'}</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.iconButton}>
                                <Feather name="edit-2" size={20} color="#007AFF" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
                                <Feather name="trash-2" size={20} color="#FF3B30" />
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Title */}
                    <Text style={styles.title}>{journal.title}</Text>

                    {/* Pillar Badge */}
                    <View style={styles.pillarBadge}>
                        <Text style={styles.pillarEmoji}>{getPillarEmoji(journal.pillar)}</Text>
                        <Text style={styles.pillarText}>{journal.pillar.toUpperCase()}</Text>
                    </View>

                    {/* Date */}
                    <Text style={styles.date}>{formatDate(journal.createdAt)}</Text>

                    {/* Scripture Block */}
                    <View style={styles.scriptureBlock}>
                        <View style={styles.scriptureHeader}>
                            <Feather name="book-open" size={16} color="#6b7280" />
                            <Text style={styles.scriptureRef}>{journal.scriptureRef}</Text>
                        </View>
                        <Text style={styles.scriptureText}>"{journal.scripture}"</Text>
                    </View>

                    {/* Original Reflection */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>💭 ORIGINAL REFLECTION</Text>
                        <Text style={styles.reflectionText}>{journal.reflection}</Text>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* User's Journal Reflections (Chronological) */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>
                            ✍️ YOUR REFLECTIONS {reflections.length > 1 && `(${reflections.length})`}
                        </Text>

                        {reflections.map((reflection, index) => (
                            <View key={reflection.id} style={styles.reflectionItem}>
                                <View style={styles.reflectionHeader}>
                                    <Text style={styles.reflectionDate}>
                                        📅 {formatDate(reflection.date)}
                                    </Text>
                                </View>

                                {isEditing && editingReflectionId === reflection.id ? (
                                    <TextInput
                                        style={styles.textInput}
                                        multiline
                                        value={editedContent}
                                        onChangeText={setEditedContent}
                                        placeholder="Write your thoughts..."
                                        placeholderTextColor="#9ca3af"
                                        autoFocus
                                        textAlignVertical="top"
                                    />
                                ) : (
                                    <Text style={styles.journalContent}>{reflection.content}</Text>
                                )}

                                {index < reflections.length - 1 && (
                                    <View style={styles.reflectionDivider} />
                                )}
                            </View>
                        ))}
                    </View>

                    {/* Add Another Reflection Button */}
                    {!isEditing && (
                        <TouchableOpacity
                            style={styles.addReflectionButton}
                            onPress={() => {
                                // TODO: Open journal editor in append mode
                                Alert.alert('Add Reflection', 'This will open the journal editor to add a new reflection.');
                            }}
                        >
                            <Feather name="plus-circle" size={20} color="#007AFF" />
                            <Text style={styles.addReflectionText}>Add Another Reflection</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    backButton: {
        padding: 4,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconButton: {
        padding: 8,
    },
    headerButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    cancelText: {
        fontSize: 16,
        color: '#6b7280',
    },
    saveButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
    },
    saveText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
        lineHeight: 36,
    },
    pillarBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginBottom: 8,
    },
    pillarEmoji: {
        fontSize: 14,
        marginRight: 6,
    },
    pillarText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6b7280',
        letterSpacing: 1,
    },
    date: {
        fontSize: 14,
        color: '#9ca3af',
        marginBottom: 24,
    },
    scriptureBlock: {
        backgroundColor: '#f9fafb',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    scriptureHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    scriptureRef: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
    scriptureText: {
        fontSize: 17,
        lineHeight: 26,
        color: '#374151',
        fontStyle: 'italic',
    },
    section: {
        marginBottom: 24,
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
        lineHeight: 24,
        color: '#374151',
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginVertical: 24,
    },
    journalContent: {
        fontSize: 16,
        lineHeight: 26,
        color: '#111827',
    },
    textInput: {
        fontSize: 16,
        lineHeight: 26,
        color: '#111827',
        minHeight: 150,
        padding: 16,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    reflectionItem: {
        marginBottom: 24,
    },
    reflectionHeader: {
        marginBottom: 12,
    },
    reflectionDate: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
    reflectionDivider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginTop: 24,
    },
    addReflectionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderStyle: 'dashed',
        gap: 8,
        marginTop: 16,
    },
    addReflectionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
    },
});


