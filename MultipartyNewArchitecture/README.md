# Multiparty — New Architecture

This sample application shows how to arrange videos and toggle the mic and camera in multiparty calls, using React Native's **New Architecture** (Fabric renderer and TurboModules).

This is the same functionality as the [Multiparty](../Multiparty) sample, but configured with the additional native infrastructure required for React Native's New Architecture.

## New Architecture Setup

This sample includes the following New Architecture-specific files:

### iOS
- `ios/FabricComponentRegistrar.h/.mm` — Registers the Vonage Video native Fabric components (`OTRNPublisherComponentView`, `OTRNSubscriberComponentView`)
- `ios/Bridging-Header.h` — Imports the Fabric registrar for Swift interop
- `ios/MultipartyNewArchitecture/AppDelegate.swift` — Calls `FabricComponentRegistrar.registerCustomComponents()` at launch
- `Info.plist` includes `RCTNewArchEnabled: true`

### Android
- `android/app/src/main/java/com/multipartynewarchitecture/MainApplication.kt` — Manually adds `OTRNPublisherPackage`, `OTRNSubscriberPackage`, and `OpentokReactNativePackage` to the package list

## Prerequisites

- Node.js >= 22.11.0
- React Native 0.84.0
- Xcode (for iOS)
- Android Studio (for Android)
- CocoaPods (`bundle install` then `bundle exec pod install` in `ios/`)

## Running the App

1. Install dependencies:

```sh
npm install
```

2. For iOS, install pods:

```sh
cd ios && bundle exec pod install && cd ..
```

3. Set your credentials in `App.js`:

```js
this.applicationId = 'YOUR_APPLICATION_ID';
this.sessionId = 'YOUR_SESSION_ID';
this.token = 'YOUR_TOKEN';
```

4. Run the app:

```sh
# iOS
npm run ios

# Android
npm run android
```
