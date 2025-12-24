# Quick Android SDK Setup

## The Problem

You need Android SDK to build the APK. Here are the fastest ways to get it:

## Option 1: Install Android Studio (Easiest - Recommended)

1. **Download Android Studio:**
   - Visit: https://developer.android.com/studio
   - Or: `wget https://redirector.gvt1.com/edgedl/android/studio/ide-zips/2023.3.1.18/android-studio-2023.3.1.18-linux.tar.gz`

2. **Extract and Run:**
   ```bash
   tar -xzf android-studio-*.tar.gz
   cd android-studio/bin
   ./studio.sh
   ```

3. **Install SDK through Android Studio:**
   - Open Android Studio
   - Click "More Actions" → "SDK Manager"
   - Install "Android SDK Platform" (API 33)
   - Install "Android SDK Build-Tools"
   - Click "Apply"

4. **Set Environment:**
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
   
   # Add to ~/.bashrc
   echo 'export ANDROID_HOME=$HOME/Android/Sdk' >> ~/.bashrc
   echo 'export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools' >> ~/.bashrc
   source ~/.bashrc
   ```

5. **Create local.properties:**
   ```bash
   cd ~/layer1blockhain/mobile-wallet
   echo "sdk.dir=$HOME/Android/Sdk" > android/local.properties
   ```

## Option 2: Command Line Tools Only (Faster, No GUI)

```bash
# Create SDK directory
mkdir -p $HOME/Android/Sdk
cd $HOME/Android/Sdk

# Download command line tools
wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip
unzip commandlinetools-linux-*.zip
mkdir -p cmdline-tools/latest
mv cmdline-tools/* cmdline-tools/latest/ 2>/dev/null || mv cmdline-tools/cmdline-tools/* cmdline-tools/latest/ 2>/dev/null || true

# Set environment
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin

# Accept licenses and install SDK
yes | sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"

# Add to bashrc
echo 'export ANDROID_HOME=$HOME/Android/Sdk' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools' >> ~/.bashrc
source ~/.bashrc

# Create local.properties
cd ~/layer1blockhain/mobile-wallet
echo "sdk.dir=$HOME/Android/Sdk" > android/local.properties
```

## Quick Test

After setup, verify:

```bash
echo $ANDROID_HOME
adb version
```

Then build:

```bash
npm run build:apk
```

## If You Already Have Android Studio

If Android Studio is installed but SDK path is different:

1. **Find SDK location:**
   - Open Android Studio
   - File → Settings → Appearance & Behavior → System Settings → Android SDK
   - Copy the "Android SDK Location" path

2. **Set it:**
   ```bash
   export ANDROID_HOME=/path/to/your/sdk  # Use the path from Android Studio
   echo "sdk.dir=$ANDROID_HOME" > ~/layer1blockhain/mobile-wallet/android/local.properties
   ```

## Minimum Requirements

- Android SDK Platform API 33 (or higher)
- Android SDK Build-Tools 33.0.0 (or higher)
- Android SDK Platform-Tools

That's it! Once SDK is installed, the build will work.

