# GrowthScope Android

GrowthScope uses Capacitor to package the existing web app as an Android application.

## App identity

- App name: GrowthScope
- Package ID: `com.growthscope.app`
- Web source: `index.html`
- Native bridge: Capacitor 8

## Local Android setup

Requirements:
- Node.js 22+
- Android Studio
- Android SDK

Commands:

```bash
npm install
npx cap add android
npx cap sync android
npx cap open android
```

Capacitor's Android project is generated in `android/`.

## Build

For a local debug APK:

```bash
cd android
./gradlew assembleDebug
```

For a release AAB:

```bash
cd android
./gradlew bundleRelease
```

The repository also includes a GitHub Actions workflow named **Build GrowthScope Android**. Run it manually from GitHub Actions to generate a test APK and a release AAB as workflow artifacts.

> The release AAB produced by this first pipeline is not yet configured with a Play Store signing key. Play Store publishing/signing is the next release step.
