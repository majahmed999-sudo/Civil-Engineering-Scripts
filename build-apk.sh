#!/bin/bash
set -e

cd /workspace/artifacts/concrete-calc-mobile

export CI=true
export ANDROID_HOME=/opt/android-sdk

# Install Node.js 24 if not present
which node || (apt-get update -qq && apt-get install -y -qq curl && curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && apt-get install -y -qq nodejs)
echo "Node: $(node -v)"

# Install pnpm
npm install -g pnpm@latest-10 2>&1 | tail -1

# Add missing babel-preset-expo before install
node -e "
const pkg = require('./package.json');
pkg.devDependencies['babel-preset-expo'] = '~14.0.0';
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
"

# Install deps (with confirmModulesPurge=false for CI)
pnpm install --no-frozen-lockfile --config.confirmModulesPurge=false 2>&1 | tail -5

# Prebuild to generate android/ folder (non-interactive, no install)
npx expo prebuild --platform android --no-install 2>&1 | tail -5

# Create local.properties for Android SDK
echo "sdk.dir=/opt/android-sdk" > android/local.properties

# Build release APK
cd android
export GRADLE_OPTS="-Dorg.gradle.daemon=false -Dorg.gradle.parallel=false"
./gradlew assembleRelease --no-daemon 2>&1 | tail -20

# Find the APK
echo "=== APK Files ==="
find /workspace -name "*.apk" -type f 2>/dev/null
echo "=== Done ==="
