# Setting Up Java for Android Build

## Quick Install (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install openjdk-11-jdk
```

## Verify Installation

```bash
java -version
```

Should show:
```
openjdk version "11.x.x"
```

## Set JAVA_HOME

### Temporary (current session)

```bash
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH
```

### Permanent (add to ~/.bashrc or ~/.zshrc)

```bash
echo 'export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64' >> ~/.bashrc
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

## Find Java Installation Path

```bash
# List available Java installations
ls -la /usr/lib/jvm/

# Or use update-alternatives
update-alternatives --list java
```

## Alternative: Install Java 17

```bash
sudo apt install openjdk-17-jdk
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
```

## Verify Setup

```bash
echo $JAVA_HOME
java -version
javac -version
```

## Build Script Auto-Detection

The `build-apk.sh` script now automatically tries to find Java. If it still fails, set JAVA_HOME manually as shown above.

