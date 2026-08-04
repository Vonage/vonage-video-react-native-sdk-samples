# Archiving — New Architecture

This sample application shows how to display and hide an archiving indicator when archiving for the session starts and stops, using React Native's **New Architecture** (Fabric renderer and TurboModules).

This is the same functionality as the [Archiving](../Archiving) sample, but configured with the additional native infrastructure required for React Native's New Architecture.

Note that you start and stop archiving using the Vonage Video REST API or the Vonage Video server SDKs. See the [Archiving](https://tokbox.com/developer/guides/archiving) developer guide.

## New Architecture Setup

This sample includes the following New Architecture-specific files:

### iOS
- `ios/FabricComponentRegistrar.h/.mm` — Registers the Vonage Video native Fabric components (`OTRNPublisherComponentView`, `OTRNSubscriberComponentView`)
- `ios/Bridging-Header.h` — Imports the Fabric registrar for Swift interop
- `ios/ArchivingNewArchitecture/AppDelegate.swift` — Calls `FabricComponentRegistrar.registerCustomComponents()` at launch
- `Info.plist` includes `RCTNewArchEnabled: true`

### Android
- `android/app/src/main/java/.../MainApplication.kt` — Manually registers `OTRNPublisherPackage`, `OTRNSubscriberPackage`, and `OpentokReactNativePackage`
- `gradle.properties` includes `newArchEnabled=true`

## Prerequisites

- Node.js >= 18
- React Native CLI
- Xcode (iOS)
- Android Studio (Android)
- CocoaPods

## Setup

1. Install dependencies:
   ```sh
   npm install
   ```

2. Install iOS pods:
   ```sh
   bundle install
   bundle exec pod install --project-directory=ios
   ```

3. Set your credentials in `App.js`:
   ```js
   this.applicationId = '<YOUR_APPLICATION_ID>';
   this.sessionId = '<YOUR_SESSION_ID>';
   this.token = '<YOUR_TOKEN>';
   ```

## Run

- **iOS:** `npm run ios`
- **Android:** `npm run android`

## Further Reading

- [Vonage Video React Native SDK](https://vonage.github.io/video-docs/video-react-native-reference/latest)
- [Vonage Video Archiving Guide](https://developer.vonage.com/en/video/guides/archiving/overview?source=video)
- [React Native New Architecture](https://reactnative.dev/docs/the-new-architecture/landing-page)
