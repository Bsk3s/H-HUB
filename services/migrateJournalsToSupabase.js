import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../src/auth/supabase-client';

const JOURNAL_STORAGE_KEY = '@heavenly_hub_journals';
const MIGRATION_COMPLETED_KEY = '@journals_migrated_to_supabase';

/**
 * One-time migration helper to move journals from AsyncStorage to Supabase
 * This should be called once on app startup after a user is authenticated
 * 
 * @returns {Object} Migration result with stats
 */
export const migrateJournalsToSupabase = async () => {
    try {
        console.log('🔄 Starting journal migration to Supabase...');

        // Check if migration was already completed
        const migrationCompleted = await AsyncStorage.getItem(MIGRATION_COMPLETED_KEY);
        if (migrationCompleted === 'true') {
            console.log('✅ Migration already completed, skipping');
            return { success: true, alreadyMigrated: true, migratedCount: 0 };
        }

        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.log('⚠️ User not authenticated, skipping migration');
            return { success: false, error: 'User not authenticated' };
        }

        // Get journals from AsyncStorage
        const journalsJson = await AsyncStorage.getItem(JOURNAL_STORAGE_KEY);
        if (!journalsJson) {
            console.log('📝 No journals found in AsyncStorage');
            // Mark migration as complete even if no journals exist
            await AsyncStorage.setItem(MIGRATION_COMPLETED_KEY, 'true');
            return { success: true, migratedCount: 0 };
        }

        const journals = JSON.parse(journalsJson);
        console.log(`📚 Found ${journals.length} journals to migrate`);

        // Migrate each journal to Supabase
        let successCount = 0;
        let errorCount = 0;

        for (const journal of journals) {
            try {
                // Transform to Supabase format
                const supabaseJournal = {
                    user_id: user.id,
                    card_id: journal.cardId || null,
                    title: journal.title,
                    content: journal.content,
                    pillar: journal.pillar || 'Other',
                    scripture: journal.scripture || null,
                    scripture_ref: journal.scriptureRef || null,
                    reflection: journal.reflection || null,
                    reflections: journal.reflections || [{
                        id: journal.id,
                        content: journal.content,
                        date: journal.createdAt,
                    }],
                    created_at: journal.createdAt || new Date().toISOString(),
                    updated_at: journal.updatedAt || new Date().toISOString(),
                };

                const { error } = await supabase
                    .from('journals')
                    .insert(supabaseJournal);

                if (error) {
                    console.error(`❌ Error migrating journal "${journal.title}":`, error);
                    errorCount++;
                } else {
                    console.log(`✅ Migrated: "${journal.title}"`);
                    successCount++;
                }
            } catch (err) {
                console.error(`❌ Error migrating journal "${journal.title}":`, err);
                errorCount++;
            }
        }

        console.log(`🎉 Migration completed: ${successCount} migrated, ${errorCount} errors`);

        // Mark migration as complete
        await AsyncStorage.setItem(MIGRATION_COMPLETED_KEY, 'true');

        // Optional: Clear AsyncStorage journals after successful migration
        if (errorCount === 0) {
            console.log('🧹 Clearing old AsyncStorage journals...');
            await AsyncStorage.removeItem(JOURNAL_STORAGE_KEY);
            console.log('✅ Old journals cleared');
        } else {
            console.log('⚠️ Keeping AsyncStorage journals due to errors');
        }

        return {
            success: true,
            migratedCount: successCount,
            errorCount: errorCount,
            totalCount: journals.length
        };
    } catch (error) {
        console.error('❌ Migration error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Reset migration flag (for testing/debugging only)
 */
export const resetMigrationFlag = async () => {
    await AsyncStorage.removeItem(MIGRATION_COMPLETED_KEY);
    console.log('🔄 Migration flag reset');
};

/**
 * Check if migration has been completed
 */
export const isMigrationCompleted = async () => {
    const completed = await AsyncStorage.getItem(MIGRATION_COMPLETED_KEY);
    return completed === 'true';
};









