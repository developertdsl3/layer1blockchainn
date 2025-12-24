# Setting Up Android SDK

## Quick Setup

### Option 1: Install Android Studio (Recommended)

1. **Download Android Studio:**
   ```bash
   # Visit: https://developer.android.com/studio
   # Or download directly:
   wget https://redirector.gvt1.com/edgedl/android/studio/ide-zips/2023.3.1.18/android-studio-2023.3.1.18-linux.tar.gz
   ```

2. **Install Android Studio:**
   ```bash
   tar -xzf android-studio-*.tar.gz
   cd android-studio/bin
   ./studio.sh
   ```

3. **Through Android Studio UI:**
   - Open Android Studio
   - Go to **Tools → SDK Manager**
   - Install **Android SDK Platform** (API 33 recommended)
   - Install **Android SDK Build-Tools**
   - Install **Android SDK Platform-Tools**

4. **Set Environment Variables:**
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   ```

5. **Add to ~/.bashrc:**
   ```bash
   echo 'export ANDROID_HOME=$HOME/Android/Sdk' >> ~/.bashrc
   echo 'export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools/bin' >> ~/.bashrc
   source ~/.bashrc
   ```

### Option 2: Command Line Tools Only (Lighter)

1. **Download Command Line Tools:**
   ```bash
   mkdir -p $HOME/Android/Sdk
   cd $HOME/Android/Sdk
   wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip
   unzip commandlinetools-linux-*.zip
   mkdir -p cmdline-tools/latest
   mv cmdline-tools/* cmdline-tools/latest/ 2>/dev/null || true
   ```

2. **Install SDK Components:**
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
   
   # Accept licenses
   yes | sdkmanager --licenses
   
   # Install required components
   sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"
   ```

3. **Set Environment Variables:**
   ```bash
   echo 'export ANDROID_HOME=$HOME/Android/Sdk' >> ~/.bashrc
   echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools' >> ~/.bashrc
   source ~/.bashrc
   ```

## Create local.properties

After setting ANDROID_HOME, create the local.properties file:

```bash
cd ~/layer1blockhain/mobile-wallet
echo "sdk.dir=$ANDROID_HOME" > android/local.properties
```

Or the build script will create it automatically if ANDROID_HOME is set.

## Verify Setup

```bash
# Check ANDROID_HOME
echo $ANDROID_HOME

# Check SDK tools
ls $ANDROID_HOME/platform-tools/adb

# Check installed platforms
ls $ANDROID_HOME/platforms

# Verify adb
adb version
```

## Quick Fix (If SDK Already Installed)

If you already have Android Studio installed but ANDROID_HOME is not set:

```bash
# Find SDK location (usually in Android Studio settings)
# Common locations:
# - $HOME/Android/Sdk
# - $HOME/.android/sdk
# - /opt/android-sdk

# Set it
export ANDROID_HOME=$HOME/Android/Sdk  # Adjust path as needed

# Create local.properties
cd ~/layer1blockhain/mobile-wallet
echo "sdk.dir=$ANDROID_HOME" > android/local.properties

# Verify
cat android/local.properties
```

## Troubleshooting

### "SDK location not found"

1. Check if Android SDK is installed:
   ```bash
   ls $HOME/Android/Sdk
   ```

2. If not found, install via Android Studio (see above)

3. Create local.properties:
   ```bash
   echo "sdk.dir=$HOME/Android/Sdk" > android/local.properties
   ```

### "ANDROID_HOME not set"

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### "adb: command not found"

```bash
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Build still fails

1. Clean and rebuild:
   ```bash
   cd android
   ./gradlew clean
   ./gradlew assembleRelease
   ```

2. Check local.properties:
   ```bash
   cat android/local.properties
   # Should show: sdk.dir=/path/to/android/sdk
   ```

## Minimum Required SDK Components

- Android SDK Platform (API 33 or higher)
- Android SDK Build-Tools (33.0.0 or higher)
- Android SDK Platform-Tools
- Android SDK Command-line Tools

## After Setup

Once ANDROID_HOME is set and local.properties is created:

```bash
npm run build:apk
```

The build should now work!

