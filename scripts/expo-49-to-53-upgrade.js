#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 EXPO 49 → 53 UPGRADE ANALYSIS');
console.log('=================================\n');

// Read current package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentDeps = packageJson.dependencies || {};

// Expo 53 compatible versions mapping
const expo53Mapping = {
    // Core
    'expo': '~53.0.0',
    'react': '19.0.0',
    'react-native': '0.79.5',
    'react-dom': '19.0.0',

    // Expo modules
    'expo-status-bar': '~2.2.3',
    'expo-constants': '~17.1.7',
    'expo-device': '~7.0.1',
    'expo-font': '~13.3.2',
    'expo-linking': '~7.1.2',
    'expo-router': '~5.1.6',
    'expo-splash-screen': '~0.29.14',
    'expo-system-ui': '~4.1.1',
    'expo-web-browser': '~14.2.0',
    'expo-auth-session': '~6.2.1',
    'expo-av': '^16.0.7',
    'expo-blur': '~14.1.5',
    'expo-build-properties': '~0.14.1',
    'expo-dev-client': '~5.2.4',
    'expo-document-picker': '~12.1.1',
    'expo-file-system': '^19.0.14',
    'expo-haptics': '~14.1.4',
    'expo-image': '~2.4.0',
    'expo-image-picker': '~15.1.1',
    'expo-linear-gradient': '~14.1.5',
    'expo-notifications': '~0.31.1',
    'expo-secure-store': '~14.1.1',
    'expo-speech': '~12.1.1',
    'expo-clipboard': '~7.1.1',
    'expo-sharing': '~13.1.1',

    // React Navigation v7
    '@react-navigation/native': '^7.1.17',
    '@react-navigation/native-stack': '^7.3.26',
    '@react-navigation/bottom-tabs': '^7.4.7',

    // React Native Community
    '@react-native-async-storage/async-storage': '2.1.2',
    '@react-native-community/datetimepicker': '8.2.0',
    '@react-native-community/netinfo': '11.4.1',
    '@react-native-community/slider': '4.5.6',
    'react-native-gesture-handler': '~2.24.0',
    'react-native-get-random-values': '~1.11.0',
    'react-native-pager-view': '6.5.1',
    'react-native-safe-area-context': '5.4.0',
    'react-native-screens': '~4.11.1',
    'react-native-svg': '15.11.2',
    'react-native-tab-view': '3.5.2',
    'react-native-url-polyfill': '^2.0.0',
    'react-native-view-shot': '4.1.0',
    'react-native-paper': '^5.14.5',
    'react-native-web': '~0.19.13',

    // Other important modules
    '@supabase/supabase-js': '^2.57.4',
    'nativewind': '^2.0.7',
    'tailwindcss': '^3.3.2',
    '@expo/vector-icons': '^14.1.0',

    // LiveKit - check compatibility
    '@livekit/react-native': '^2.9.1',
    '@livekit/react-native-expo-plugin': '^1.0.1',
    '@livekit/react-native-webrtc': '^137.0.2',
    'livekit-client': '^2.15.7',

    // Keep same (should be compatible)
    'buffer': '^6.0.3',
    'base-64': '^1.0.0',
    'axios': '^1.11.0',
    'date-fns': '^4.1.0',
    'uuid': '^11.1.0',
    'zod': '^3.25.76',
    '@anthropic-ai/sdk': '^0.54.0',
    'openai': '^5.11.0',
    'lucide-react-native': '^0.468.0',
};

// Analyze what needs upgrading
const upgrades = [];
const compatible = [];
const unknown = [];

Object.keys(currentDeps).forEach(dep => {
    const currentVersion = currentDeps[dep];
    const expo53Version = expo53Mapping[dep];

    if (expo53Version) {
        if (currentVersion !== expo53Version) {
            upgrades.push({
                name: dep,
                from: currentVersion,
                to: expo53Version,
                type: 'upgrade'
            });
        } else {
            compatible.push({ name: dep, version: currentVersion });
        }
    } else {
        unknown.push({ name: dep, version: currentVersion });
    }
});

// Display results
console.log('📈 MODULES THAT NEED UPGRADING:', upgrades.length);
console.log('=====================================');
upgrades.forEach(mod => {
    const severity = getSeverity(mod.from, mod.to);
    console.log(`${severity} ${mod.name}: ${mod.from} → ${mod.to}`);
});

console.log('\n✅ ALREADY COMPATIBLE:', compatible.length);
console.log('=====================================');
compatible.forEach(mod => {
    console.log(`  ✓ ${mod.name}@${mod.version}`);
});

console.log('\n❓ NEED MANUAL CHECK:', unknown.length);
console.log('=====================================');
unknown.forEach(mod => {
    console.log(`  ? ${mod.name}@${mod.version}`);
});

// Risk assessment
const majorUpgrades = upgrades.filter(m => isMajorUpgrade(m.from, m.to));
const minorUpgrades = upgrades.filter(m => !isMajorUpgrade(m.from, m.to));

console.log('\n🚨 RISK ASSESSMENT:');
console.log('=====================================');
console.log(`🔴 HIGH RISK (Major upgrades): ${majorUpgrades.length}`);
majorUpgrades.forEach(mod => {
    console.log(`     ${mod.name}: ${mod.from} → ${mod.to}`);
});

console.log(`🟡 MEDIUM RISK (Minor upgrades): ${minorUpgrades.length}`);
console.log(`🟢 LOW RISK (Compatible): ${compatible.length}`);

// Generate upgrade commands
console.log('\n📋 UPGRADE COMMANDS:');
console.log('=====================================');

// Phase 1: Core upgrades
const coreUpgrades = upgrades.filter(m =>
    ['expo', 'react', 'react-native', 'react-dom'].includes(m.name)
);

if (coreUpgrades.length > 0) {
    console.log('\n🎯 PHASE 1 - Core Framework:');
    const coreCmd = coreUpgrades.map(m => `${m.name}@"${m.to}"`).join(' ');
    console.log(`npm install ${coreCmd}`);
}

// Phase 2: Navigation upgrades
const navUpgrades = upgrades.filter(m =>
    m.name.includes('@react-navigation')
);

if (navUpgrades.length > 0) {
    console.log('\n🧭 PHASE 2 - Navigation:');
    const navCmd = navUpgrades.map(m => `${m.name}@"${m.to}"`).join(' ');
    console.log(`npm install ${navCmd}`);
}

// Phase 3: Expo modules
const expoUpgrades = upgrades.filter(m =>
    m.name.startsWith('expo-') && !coreUpgrades.includes(m)
);

if (expoUpgrades.length > 0) {
    console.log('\n📱 PHASE 3 - Expo Modules:');
    const expoCmd = expoUpgrades.map(m => `${m.name}@"${m.to}"`).join(' ');
    console.log(`npm install ${expoCmd}`);
}

// Phase 4: Community modules
const communityUpgrades = upgrades.filter(m =>
    m.name.includes('@react-native-community') ||
    m.name.startsWith('react-native-') && !m.name.includes('@')
);

if (communityUpgrades.length > 0) {
    console.log('\n🏘️  PHASE 4 - Community Modules:');
    const communityCmd = communityUpgrades.map(m => `${m.name}@"${m.to}"`).join(' ');
    console.log(`npm install ${communityCmd}`);
}

// Phase 5: Other modules
const otherUpgrades = upgrades.filter(m =>
    !coreUpgrades.includes(m) &&
    !navUpgrades.includes(m) &&
    !expoUpgrades.includes(m) &&
    !communityUpgrades.includes(m)
);

if (otherUpgrades.length > 0) {
    console.log('\n🔧 PHASE 5 - Other Modules:');
    const otherCmd = otherUpgrades.map(m => `${m.name}@"${m.to}"`).join(' ');
    console.log(`npm install ${otherCmd}`);
}

console.log('\n🎯 UPGRADE STRATEGY:');
console.log('=====================================');
console.log('1. Backup current working project');
console.log('2. Run upgrades in phases (test after each)');
console.log('3. Update app.json for Expo 53');
console.log('4. Update babel.config.js if needed');
console.log('5. Test core functionality');
console.log('6. Fix any breaking changes');
console.log('7. Test on device');

const successProbability = calculateSuccessProbability(majorUpgrades.length, minorUpgrades.length, compatible.length);
console.log(`\n🎲 SUCCESS PROBABILITY: ${successProbability}%`);

if (successProbability >= 70) {
    console.log('✅ HIGH CHANCE OF SUCCESS! This upgrade looks very doable! 🎉');
} else if (successProbability >= 50) {
    console.log('⚠️  MODERATE RISK - Proceed carefully with good backups');
} else {
    console.log('🚨 HIGH RISK - Consider piece-by-piece migration instead');
}

// Helper functions
function getSeverity(from, to) {
    if (isMajorUpgrade(from, to)) return '🔴';
    if (isMinorUpgrade(from, to)) return '🟡';
    return '🟢';
}

function isMajorUpgrade(from, to) {
    // Simple heuristic - if major version changes
    const fromMajor = from.match(/(\d+)/)?.[1];
    const toMajor = to.match(/(\d+)/)?.[1];
    return fromMajor !== toMajor;
}

function isMinorUpgrade(from, to) {
    return !isMajorUpgrade(from, to);
}

function calculateSuccessProbability(major, minor, compatible) {
    const total = major + minor + compatible;
    if (total === 0) return 100;

    const compatibleWeight = compatible * 1.0;
    const minorWeight = minor * 0.7;
    const majorWeight = major * 0.3;

    return Math.round(((compatibleWeight + minorWeight + majorWeight) / total) * 100);
}

console.log('\n🚀 Ready to upgrade? This analysis shows it\'s definitely possible!');
