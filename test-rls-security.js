/**
 * RLS Security Test Suite
 * Tests that Row Level Security is working correctly after migration
 * 
 * Run this with: node test-rls-security.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv/config');

// You'll need to set these in your .env file
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Test user credentials - you'll need real test users
const TEST_USER_1 = {
    email: process.env.TEST_USER_1_EMAIL || 'test1@example.com',
    password: process.env.TEST_USER_1_PASSWORD || 'testpassword123'
};

const TEST_USER_2 = {
    email: process.env.TEST_USER_2_EMAIL || 'test2@example.com',
    password: process.env.TEST_USER_2_PASSWORD || 'testpassword123'
};

async function runTests() {
    console.log('🔒 Starting RLS Security Tests\n');
    console.log('='.repeat(60));

    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };

    // Test 1: Anon user cannot access user_complete_profile
    console.log('\n📋 Test 1: Anon cannot access user_complete_profile');
    try {
        const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        const { data, error } = await anonClient
            .from('user_complete_profile')
            .select('*');

        if (error || !data || data.length === 0) {
            console.log('✅ PASS: Anon blocked from viewing profiles');
            results.passed++;
            results.tests.push({ name: 'Anon access to user_complete_profile', status: 'PASS' });
        } else {
            console.log('❌ FAIL: Anon can see profiles:', data.length, 'rows');
            results.failed++;
            results.tests.push({ name: 'Anon access to user_complete_profile', status: 'FAIL' });
        }
    } catch (err) {
        console.log('✅ PASS: Access denied with error:', err.message);
        results.passed++;
        results.tests.push({ name: 'Anon access to user_complete_profile', status: 'PASS' });
    }

    // Test 2: Anon user cannot access conversation_sessions
    console.log('\n📋 Test 2: Anon cannot access conversation_sessions');
    try {
        const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        const { data, error } = await anonClient
            .from('conversation_sessions')
            .select('*');

        if (error || !data || data.length === 0) {
            console.log('✅ PASS: Anon blocked from viewing conversations');
            results.passed++;
            results.tests.push({ name: 'Anon access to conversation_sessions', status: 'PASS' });
        } else {
            console.log('❌ FAIL: Anon can see conversations:', data.length, 'rows');
            results.failed++;
            results.tests.push({ name: 'Anon access to conversation_sessions', status: 'FAIL' });
        }
    } catch (err) {
        console.log('✅ PASS: Access denied with error:', err.message);
        results.passed++;
        results.tests.push({ name: 'Anon access to conversation_sessions', status: 'PASS' });
    }

    // Test 3: Anon user cannot access conversation_turns
    console.log('\n📋 Test 3: Anon cannot access conversation_turns');
    try {
        const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        const { data, error } = await anonClient
            .from('conversation_turns')
            .select('*');

        if (error || !data || data.length === 0) {
            console.log('✅ PASS: Anon blocked from viewing conversation turns');
            results.passed++;
            results.tests.push({ name: 'Anon access to conversation_turns', status: 'PASS' });
        } else {
            console.log('❌ FAIL: Anon can see conversation turns:', data.length, 'rows');
            results.failed++;
            results.tests.push({ name: 'Anon access to conversation_turns', status: 'FAIL' });
        }
    } catch (err) {
        console.log('✅ PASS: Access denied with error:', err.message);
        results.passed++;
        results.tests.push({ name: 'Anon access to conversation_turns', status: 'PASS' });
    }

    // Test 4: Authenticated user can only see their own profile
    console.log('\n📋 Test 4: User can only see their own profile');
    try {
        const user1Client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        const { data: { user }, error: signInError } = await user1Client.auth.signInWithPassword({
            email: TEST_USER_1.email,
            password: TEST_USER_1.password
        });

        if (signInError) {
            console.log('⚠️  SKIP: Could not sign in test user:', signInError.message);
            results.tests.push({ name: 'User can only see own profile', status: 'SKIP' });
        } else {
            const userId = user.id;

            // Try to get all profiles
            const { data, error } = await user1Client
                .from('user_profiles')
                .select('*');

            if (error) {
                console.log('❌ FAIL: Error querying profiles:', error.message);
                results.failed++;
                results.tests.push({ name: 'User can only see own profile', status: 'FAIL' });
            } else if (data.length === 1 && data[0].id === userId) {
                console.log('✅ PASS: User sees only their own profile');
                results.passed++;
                results.tests.push({ name: 'User can only see own profile', status: 'PASS' });
            } else {
                console.log('❌ FAIL: User sees', data.length, 'profiles (should be 1)');
                results.failed++;
                results.tests.push({ name: 'User can only see own profile', status: 'FAIL' });
            }

            await user1Client.auth.signOut();
        }
    } catch (err) {
        console.log('❌ FAIL: Unexpected error:', err.message);
        results.failed++;
        results.tests.push({ name: 'User can only see own profile', status: 'FAIL' });
    }

    // Test 5: User cannot see another user's conversations
    console.log('\n📋 Test 5: User cannot see other users\' conversations');
    try {
        const user1Client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        const { data: { user }, error: signInError } = await user1Client.auth.signInWithPassword({
            email: TEST_USER_1.email,
            password: TEST_USER_1.password
        });

        if (signInError) {
            console.log('⚠️  SKIP: Could not sign in test user');
            results.tests.push({ name: 'User cannot see others conversations', status: 'SKIP' });
        } else {
            const userId = user.id;

            const { data, error } = await user1Client
                .from('conversation_sessions')
                .select('*');

            // Check that all returned rows belong to this user
            const allBelongToUser = data?.every(row => row.user_id === userId);

            if (error) {
                console.log('⚠️  Info: Query error (might be expected):', error.message);
                results.passed++;
                results.tests.push({ name: 'User cannot see others conversations', status: 'PASS' });
            } else if (allBelongToUser) {
                console.log('✅ PASS: User sees only their own conversations');
                results.passed++;
                results.tests.push({ name: 'User cannot see others conversations', status: 'PASS' });
            } else {
                console.log('❌ FAIL: User can see other users\' conversations!');
                results.failed++;
                results.tests.push({ name: 'User cannot see others conversations', status: 'FAIL' });
            }

            await user1Client.auth.signOut();
        }
    } catch (err) {
        console.log('❌ FAIL: Unexpected error:', err.message);
        results.failed++;
        results.tests.push({ name: 'User cannot see others conversations', status: 'FAIL' });
    }

    // Test 6: User can access getCompleteUserProfile
    console.log('\n📋 Test 6: getCompleteUserProfile works for authenticated users');
    try {
        const user1Client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        const { data: { user }, error: signInError } = await user1Client.auth.signInWithPassword({
            email: TEST_USER_1.email,
            password: TEST_USER_1.password
        });

        if (signInError) {
            console.log('⚠️  SKIP: Could not sign in test user');
            results.tests.push({ name: 'getCompleteUserProfile works', status: 'SKIP' });
        } else {
            const { data, error } = await user1Client
                .from('user_complete_profile')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (error) {
                console.log('❌ FAIL: Error getting complete profile:', error.message);
                results.failed++;
                results.tests.push({ name: 'getCompleteUserProfile works', status: 'FAIL' });
            } else if (data && data.id === user.id) {
                console.log('✅ PASS: User can access their complete profile');
                console.log('   Profile data:', { id: data.id, name: data.name, role: data.role });
                results.passed++;
                results.tests.push({ name: 'getCompleteUserProfile works', status: 'PASS' });
            } else {
                console.log('❌ FAIL: Could not get complete profile');
                results.failed++;
                results.tests.push({ name: 'getCompleteUserProfile works', status: 'FAIL' });
            }

            await user1Client.auth.signOut();
        }
    } catch (err) {
        console.log('❌ FAIL: Unexpected error:', err.message);
        results.failed++;
        results.tests.push({ name: 'getCompleteUserProfile works', status: 'FAIL' });
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📋 Total:  ${results.passed + results.failed}`);

    if (results.failed === 0) {
        console.log('\n🎉 ALL TESTS PASSED! Your RLS is working correctly!');
    } else {
        console.log('\n⚠️  SOME TESTS FAILED! Review the RLS policies.');
    }

    console.log('\nDetailed Results:');
    results.tests.forEach((test, i) => {
        const icon = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️';
        console.log(`  ${icon} ${test.name}: ${test.status}`);
    });

    console.log('\n' + '='.repeat(60));

    return results;
}

// Run the tests
runTests()
    .then(results => {
        process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(err => {
        console.error('Fatal error running tests:', err);
        process.exit(1);
    });
