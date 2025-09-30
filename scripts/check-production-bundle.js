#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Analyzing production bundle for Hermes compatibility issues...\n');

// Step 1: Generate production bundle (same as EAS uses)
console.log('📦 Generating production bundle...');
const bundleDir = '/tmp/hb_bundle_check';
const bundlePath = `${bundleDir}/main.jsbundle`;

try {
    // Clean and create temp directory
    execSync(`rm -rf ${bundleDir} && mkdir -p ${bundleDir}`, { stdio: 'inherit' });

    // Generate bundle using Expo's exact method
    execSync(`npx @expo/cli export:embed --entry-file index.js --platform ios --dev false --reset-cache --bundle-output ${bundlePath} --assets-dest ${bundleDir} --sourcemap-output ${bundlePath}.map`, {
        stdio: 'inherit',
        cwd: process.cwd()
    });

    console.log('✅ Bundle generated successfully\n');
} catch (error) {
    console.error('❌ Failed to generate bundle:', error.message);
    process.exit(1);
}

// Step 2: Read and analyze the bundle
console.log('🔍 Analyzing bundle for problematic patterns...');
const bundleContent = fs.readFileSync(bundlePath, 'utf8');
const lines = bundleContent.split('\n');

// Patterns that cause "Object is not a function" in Hermes
const problematicPatterns = [
    {
        name: 'Dynamic imports',
        regex: /import\s*\(/g,
        description: 'await import() calls that fail in Hermes production'
    },
    {
        name: 'Dynamic require with .default',
        regex: /require\([^)]+\)\.default/g,
        description: 'require().default patterns that fail in Hermes'
    },
    {
        name: 'Conditional requires',
        regex: /\?\s*require\s*\(|\:\s*require\s*\(/g,
        description: 'Conditional require() calls that may not resolve'
    },
    {
        name: 'Mixed module exports',
        regex: /__esModule.*require|require.*__esModule/g,
        description: 'Mixed CommonJS/ES6 patterns that confuse Hermes'
    }
];

let issuesFound = false;
const foundIssues = [];

// Check each pattern
problematicPatterns.forEach(pattern => {
    const matches = [...bundleContent.matchAll(pattern.regex)];

    if (matches.length > 0) {
        issuesFound = true;
        console.log(`\n⚠️  Found ${matches.length} instances of: ${pattern.name}`);
        console.log(`   Description: ${pattern.description}`);

        // Show first few matches with line numbers
        matches.slice(0, 3).forEach((match, index) => {
            const position = match.index;
            const beforeText = bundleContent.substring(0, position);
            const lineNumber = beforeText.split('\n').length;
            const lineStart = beforeText.lastIndexOf('\n') + 1;
            const lineEnd = bundleContent.indexOf('\n', position);
            const lineContent = bundleContent.substring(lineStart, lineEnd);

            console.log(`   Line ${lineNumber}: ${lineContent.trim().substring(0, 100)}...`);
        });

        if (matches.length > 3) {
            console.log(`   ... and ${matches.length - 3} more instances`);
        }

        foundIssues.push({
            pattern: pattern.name,
            count: matches.length,
            description: pattern.description
        });
    }
});

// Step 3: Report results
console.log('\n' + '='.repeat(60));

if (issuesFound) {
    console.log('❌ BUNDLE ANALYSIS FAILED');
    console.log('\nFound patterns that will cause "Object is not a function" crashes in Hermes:');

    foundIssues.forEach(issue => {
        console.log(`\n• ${issue.pattern}: ${issue.count} instances`);
        console.log(`  ${issue.description}`);
    });

    console.log('\n🔧 RECOMMENDED FIXES:');
    console.log('1. Replace dynamic imports with static imports');
    console.log('2. Replace require().default with proper ES6 imports');
    console.log('3. Avoid conditional requires - use static imports');
    console.log('4. Ensure consistent module export patterns');

    console.log('\n⚠️  DO NOT run EAS build until these issues are fixed!');
    process.exit(1);
} else {
    console.log('✅ BUNDLE ANALYSIS PASSED');
    console.log('\nNo problematic patterns found in production bundle.');
    console.log('Bundle should be compatible with Hermes production builds.');
    console.log('\n🚀 Safe to proceed with EAS build!');
}

// Cleanup
execSync(`rm -rf ${bundleDir}`);









