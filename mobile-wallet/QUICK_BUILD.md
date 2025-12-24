# Quick APK Build Guide

## Fastest Way to Build APK

```bash
cd mobile-wallet
npm run build:apk
```

Or manually:

```bash
cd mobile-wallet/android
./gradlew assembleRelease
```

## APK Location

After build completes, find your APK at:

```
android/app/build/outputs/apk/release/app-release.apk
```

## Install on Device

```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

## Prerequisites

1. **Android SDK installed** (via Android Studio)
2. **ANDROID_HOME set:**
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
   ```

3. **Java JDK 11+** (usually comes with Android Studio)

## Quick Commands

| Command | Description |
|---------|-------------|
| `npm run build:apk` | Build release APK (uses script) |
| `npm run build:apk:release` | Build release APK directly |
| `npm run build:apk:debug` | Build debug APK (faster, larger) |

## Troubleshooting

**"ANDROID_HOME not set":**
```bash
export ANDROID_HOME=$HOME/Android/Sdk
```

**"Gradle not found":**
```bash
cd android
chmod +x gradlew
./gradlew --version
```

**Build fails:**
```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

## That's It! 🚀

Your APK is ready at: `android/app/build/outputs/apk/release/app-release.apk`

