import { supabase } from '../src/auth/supabase-client';

/**
 * Journal Service - Supabase Backend
 * Handles storage and retrieval of journal entries with auto-tagging
 * Now stores journals in Supabase for cross-device sync and user-specific access
 */

const getUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    return user.id;
};

/**
 * Save a new journal entry or add reflection to existing
 * @param {Object} entry - Journal entry object with pillar auto-tag
 * @param {Boolean} isNewReflection - If true, append to existing journal
 */
export const saveJournalEntry = async (entry, isNewReflection = false) => {
    try {
        console.log('💾 Saving journal entry:', entry.title);
        const userId = await getUserId();

        if (isNewReflection && entry.cardId) {
            // Check if journal already exists for this card
            const { data: existing, error: fetchError } = await supabase
                .from('journals')
                .select('*')
                .eq('user_id', userId)
                .eq('card_id', entry.cardId)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                throw fetchError;
            }

            if (existing) {
                // Append reflection to existing journal
                let reflections = existing.reflections || [];

                // Initialize reflections array if it doesn't exist (for backward compatibility)
                if (reflections.length === 0) {
                    reflections = [{
                        id: existing.id,
                        content: existing.content,
                        date: existing.created_at,
                    }];
                }

                // Add new reflection
                reflections.push({
                    id: Date.now().toString(),
                    content: entry.content,
                    date: new Date().toISOString(),
                });

                // Update the journal
                const { data: updated, error: updateError } = await supabase
                    .from('journals')
                    .update({
                        reflections: reflections,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existing.id)
                    .select()
                    .single();

                if (updateError) throw updateError;

                console.log('✅ Reflection added to existing journal');
                return { success: true, entry: updated, isAppended: true };
            }
        }

        // Create new journal entry with reflections array
        const newEntry = {
            user_id: userId,
            card_id: entry.cardId || null,
            title: entry.title,
            content: entry.content,
            pillar: entry.pillar || 'Other',
            scripture: entry.scripture || null,
            scripture_ref: entry.scriptureRef || null,
            reflection: entry.reflection || null,
            reflections: [{
                id: entry.id,
                content: entry.content,
                date: entry.createdAt || new Date().toISOString(),
            }]
        };

        const { data: created, error: insertError } = await supabase
            .from('journals')
            .insert(newEntry)
            .select()
            .single();

        if (insertError) throw insertError;

        console.log('✅ Journal entry saved successfully');
        return { success: true, entry: created };
    } catch (error) {
        console.error('❌ Error saving journal entry:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get all journal entries for the current user
 * @returns {Array} Array of journal entries
 */
export const getAllJournals = async () => {
    try {
        const userId = await getUserId();

        const { data, error } = await supabase
            .from('journals')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform to match existing format (camelCase for React components)
        return data.map(journal => ({
            id: journal.id,
            cardId: journal.card_id,
            title: journal.title,
            content: journal.content,
            pillar: journal.pillar,
            scripture: journal.scripture,
            scriptureRef: journal.scripture_ref,
            reflection: journal.reflection,
            reflections: journal.reflections || [],
            createdAt: journal.created_at,
            updatedAt: journal.updated_at,
        }));
    } catch (error) {
        console.error('❌ Error getting journals:', error);
        return [];
    }
};

/**
 * Get journals filtered by pillar
 * @param {String} pillar - Pillar name (e.g., "Faith", "Hope", "Prayer")
 * @returns {Array} Array of filtered journal entries
 */
export const getJournalsByPillar = async (pillar) => {
    try {
        const userId = await getUserId();

        const { data, error } = await supabase
            .from('journals')
            .select('*')
            .eq('user_id', userId)
            .eq('pillar', pillar)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform to match existing format
        return data.map(journal => ({
            id: journal.id,
            cardId: journal.card_id,
            title: journal.title,
            content: journal.content,
            pillar: journal.pillar,
            scripture: journal.scripture,
            scriptureRef: journal.scripture_ref,
            reflection: journal.reflection,
            reflections: journal.reflections || [],
            createdAt: journal.created_at,
            updatedAt: journal.updated_at,
        }));
    } catch (error) {
        console.error('❌ Error getting journals by pillar:', error);
        return [];
    }
};

/**
 * Get journals grouped by pillar
 * @returns {Object} Object with pillars as keys and arrays of journals as values
 */
export const getJournalsGroupedByPillar = async () => {
    try {
        const allJournals = await getAllJournals();

        const grouped = {
            Faith: [],
            Hope: [],
            Prayer: [],
            Love: [],
            Other: [],
        };

        allJournals.forEach(journal => {
            const pillar = journal.pillar || 'Other';
            if (grouped[pillar]) {
                grouped[pillar].push(journal);
            } else {
                grouped.Other.push(journal);
            }
        });

        return grouped;
    } catch (error) {
        console.error('❌ Error grouping journals by pillar:', error);
        return {
            Faith: [],
            Hope: [],
            Prayer: [],
            Love: [],
            Other: [],
        };
    }
};

/**
 * Check if user has journaled about a specific card
 * @param {String} cardId - Card ID
 * @returns {Object|null} Journal entry if exists, null otherwise
 */
export const getJournalByCardId = async (cardId) => {
    try {
        const userId = await getUserId();

        const { data, error } = await supabase
            .from('journals')
            .select('*')
            .eq('user_id', userId)
            .eq('card_id', cardId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        if (!data) return null;

        // Transform to match existing format
        return {
            id: data.id,
            cardId: data.card_id,
            title: data.title,
            content: data.content,
            pillar: data.pillar,
            scripture: data.scripture,
            scriptureRef: data.scripture_ref,
            reflection: data.reflection,
            reflections: data.reflections || [],
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    } catch (error) {
        console.error('❌ Error checking journal by card:', error);
        return null;
    }
};

/**
 * Update an existing journal entry
 * @param {Object} updatedJournal - Updated journal object
 */
export const updateJournalEntry = async (updatedJournal) => {
    try {
        console.log('📝 Updating journal entry:', updatedJournal.id);
        const userId = await getUserId();

        const { data, error } = await supabase
            .from('journals')
            .update({
                title: updatedJournal.title,
                content: updatedJournal.content,
                pillar: updatedJournal.pillar,
                scripture: updatedJournal.scripture,
                scripture_ref: updatedJournal.scriptureRef,
                reflection: updatedJournal.reflection,
                reflections: updatedJournal.reflections,
                updated_at: new Date().toISOString()
            })
            .eq('id', updatedJournal.id)
            .eq('user_id', userId) // Extra security check
            .select()
            .single();

        if (error) throw error;

        console.log('✅ Journal entry updated successfully');
        return { success: true, entry: data };
    } catch (error) {
        console.error('❌ Error updating journal entry:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Delete a journal entry
 * @param {String} journalId - Journal entry ID
 */
export const deleteJournalEntry = async (journalId) => {
    try {
        console.log('🗑️ Deleting journal entry:', journalId);
        const userId = await getUserId();

        const { error } = await supabase
            .from('journals')
            .delete()
            .eq('id', journalId)
            .eq('user_id', userId); // Extra security check

        if (error) throw error;

        console.log('✅ Journal entry deleted successfully');
        return { success: true };
    } catch (error) {
        console.error('❌ Error deleting journal entry:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get count of journals by pillar
 * @returns {Object} Object with pillar counts
 */
export const getJournalCountsByPillar = async () => {
    try {
        const grouped = await getJournalsGroupedByPillar();

        return {
            Faith: grouped.Faith.length,
            Hope: grouped.Hope.length,
            Prayer: grouped.Prayer.length,
            Love: grouped.Love.length,
            Other: grouped.Other.length,
        };
    } catch (error) {
        console.error('❌ Error getting journal counts:', error);
        return {
            Faith: 0,
            Hope: 0,
            Prayer: 0,
            Love: 0,
            Other: 0,
        };
    }
};
