# Building APK for MyL1 Mobile Wallet

## Quick Build (Unsigned APK - for testing)

### Option 1: Using the build script

```bash
cd mobile-wallet
./build-apk.sh
```

### Option 2: Manual build

```bash
cd mobile-wallet/android
./gradlew clean
./gradlew assembleRelease
```

The APK will be located at:
```
android/app/build/outputs/apk/release/app-release.apk
```

## Installing the APK

### On connected device/emulator:

```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

### Or transfer to device:

1. Copy APK to device via USB, email, or cloud storage
2. Enable "Install from Unknown Sources" in Android settings
3. Open APK file on device and install

## Building Signed APK (for Production/Play Store)

### Step 1: Generate a Keystore

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore myl1-wallet-release.keystore -alias myl1-wallet-key -keyalg RSA -keysize 2048 -validity 10000
```

**Important:** Save the password and keystore file securely!

### Step 2: Configure Gradle

Create `android/keystore.properties`:

```properties
MYL1_RELEASE_STORE_FILE=myl1-wallet-release.keystore
MYL1_RELEASE_KEY_ALIAS=myl1-wallet-key
MYL1_RELEASE_STORE_PASSWORD=your-store-password
MYL1_RELEASE_KEY_PASSWORD=your-key-password
```

**⚠️ Add to .gitignore:**
```bash
echo "android/keystore.properties" >> .gitignore
echo "*.keystore" >> .gitignore
```

### Step 3: Update build.gradle

Edit `android/app/build.gradle` and add before `android {`:

```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Then update the `android {` block to include signing config:

```gradle
android {
    ...
    
    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                storeFile file(keystoreProperties['MYL1_RELEASE_STORE_FILE'])
                storePassword keystoreProperties['MYL1_RELEASE_STORE_PASSWORD']
                keyAlias keystoreProperties['MYL1_RELEASE_KEY_ALIAS']
                keyPassword keystoreProperties['MYL1_RELEASE_KEY_PASSWORD']
            }
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Step 4: Build Signed APK

```bash
cd android
./gradlew assembleRelease
```

The signed APK will be at:
```
android/app/build/outputs/apk/release/app-release.apk
```

## Build Variants

### Debug APK (for development)

```bash
cd android
./gradlew assembleDebug
```

Location: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK (for distribution)

```bash
cd android
./gradlew assembleRelease
```

Location: `android/app/build/outputs/apk/release/app-release.apk`

## APK Size Optimization

### Enable ProGuard/R8

Already configured in `build.gradle` for release builds. This will:
- Remove unused code
- Optimize bytecode
- Reduce APK size

### Split APKs by ABI

To create separate APKs for different architectures:

```bash
cd android
./gradlew assembleRelease
```

This creates:
- `app-armeabi-v7a-release.apk` (32-bit ARM)
- `app-arm64-v8a-release.apk` (64-bit ARM)
- `app-x86-release.apk` (x86)
- `app-x86_64-release.apk` (x86_64)

Or use universal APK:
- `app-universal-release.apk` (all architectures)

## Troubleshooting

### Build fails with "ANDROID_HOME not set"

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

Add to `~/.bashrc` or `~/.zshrc` for permanent setup.

### Build fails with "SDK not found"

1. Install Android Studio
2. Open Android Studio → SDK Manager
3. Install Android SDK (API 33 recommended)
4. Set ANDROID_HOME environment variable

### "Gradle sync failed"

```bash
cd android
./gradlew clean
./gradlew --refresh-dependencies
```

### APK too large

- Enable ProGuard (already in release build)
- Remove unused dependencies
- Use split APKs by ABI
- Optimize images and assets

### "INSTALL_FAILED_UPDATE_INCOMPATIBLE"

Uninstall previous version first:
```bash
adb uninstall com.myl1wallet
adb install app-release.apk
```

## Testing the APK

### Install on emulator

```bash
# Start emulator
emulator -avd <emulator_name>

# Install APK
adb install android/app/build/outputs/apk/release/app-release.apk
```

### Install on physical device

1. Enable USB debugging on device
2. Connect via USB
3. Verify connection: `adb devices`
4. Install: `adb install app-release.apk`

### Test functionality

1. Open the app
2. Create or import wallet
3. Connect to MyL1 node (ensure node is running)
4. Test send/receive functionality
5. Verify balance updates

## Distribution

### Internal Testing

- Share APK via email/cloud storage
- Use Firebase App Distribution
- Use TestFlight (for iOS)

### Google Play Store

1. Build signed APK (see above)
2. Create Google Play Console account
3. Create new app
4. Upload APK/AAB
5. Fill in store listing
6. Submit for review

### Alternative Stores

- F-Droid (open source)
- Amazon Appstore
- Samsung Galaxy Store
- Direct APK distribution

## APK Information

After building, check APK info:

```bash
aapt dump badging android/app/build/outputs/apk/release/app-release.apk
```

Or use online tools:
- https://www.apkmirror.com/apk-analyzer/
- https://apkpure.com/apk-analyzer

## Next Steps

1. ✅ Build unsigned APK for testing
2. ⏭️ Generate keystore for production
3. ⏭️ Build signed APK
4. ⏭️ Test on multiple devices
5. ⏭️ Distribute via Play Store or direct download

