# Calling Services (CallKit / ConnectionService)

This sample shows how to run a Vonage Video call through the platform's native calling system — **CallKit** on iOS and **ConnectionService** (Telecom) on Android — using [`react-native-callkeep`](https://github.com/react-native-webrtc/react-native-callkeep) together with the SDK's calling-services API.

When CallKit or Telecom owns the call, the operating system — not the Video SDK — decides when the call's audio starts and stops. The calling-services API lets the app hand that control to the OS and forward each audio lifecycle event to the SDK.

> **Note:** the calling-services API is not in a released SDK version yet. This sample installs the SDK from the [pull request branch](https://github.com/Vonage/vonage-video-react-native-sdk/pull/286); switch `@vonage/client-sdk-video-react-native` in `package.json` to the first release that includes it once it ships.

## How it works

| Moment | App code | SDK call |
|---|---|---|
| App start | — | `enableCallingServicesMode()` (iOS), `setRequestAudioFocus(false)` (Android) |
| Call answered / started | `answerCall`, `didReceiveStartCallAction` | `preconfigureAudioSessionForCall()`, then join the session |
| OS activates call audio | `didActivateAudioSession` | `notifyAudioSessionActivated()` (iOS) |
| Call is active | — | `notifyAudioFocusActivated()` (Android) |
| OS deactivates call audio | `didDeactivateAudioSession` | `notifyAudioSessionDeactivated()` (iOS) |
| Call ended | `endCall` | `notifyAudioFocusDeactivated()` (Android), leave the session |

Each method is a no-op on the platform it does not apply to, so the app calls them unconditionally. On iOS, `isCallingServicesModeAvailable()` returns `false` when a custom audio device is installed (for example when a session uses `enableStereoOutput`), because calling-services mode needs the SDK's default audio device.

Every call and its result is printed in the on-screen log.

## Platform notes

### iOS
- `Info.plist` declares the `audio` and `voip` background modes, plus camera and microphone usage descriptions.
- `ios/CallingServices/FabricComponentRegistrar.{h,mm}` registers the Vonage Video Fabric components; `AppDelegate.swift` calls it at launch.
- The minimum deployment target is iOS 17, matching the SDK.

### Android
- Runs Telecom in **self-managed** mode: the app draws its own ringing UI. When `react-native-callkeep` fires `showIncomingCallUi`, the sample shows **Answer** / **Decline** buttons.
- `AndroidManifest.xml` declares `io.wazo.callkeep.VoiceConnectionService` and the Telecom, foreground-service, camera and microphone permissions.
- `MainApplication.kt` registers the Vonage Video packages manually.
- `gradle.properties` keeps AGP 9's built-in Kotlin enabled, because the Vonage Video Android library relies on it.
- `patches/react-native-callkeep+4.3.16.patch` (applied by `patch-package` on install) removes `@ReactMethod` from two overloaded Java methods. Without it, the New Architecture interop layer refuses to load `RNCallKeep` ("Module exports two methods to JavaScript with the same name").

## Simulator and emulator limits

- **iOS Simulator:** outgoing calls work end to end. CallKit ends simulated incoming calls immediately and never activates the call's audio session, so `didActivateAudioSession` does not fire. Test incoming calls and call audio on a physical device.
- **Android Emulator:** outgoing and incoming (self-managed) calls work end to end.

In production, an incoming call arrives as a VoIP push (PushKit, iOS) or a high-priority FCM data message (Android), whose handler calls `RNCallKeep.displayIncomingCall`. The **Simulate incoming call** button stands in for that step.

## Prerequisites

- Node.js >= 22.13.0
- Xcode 26+ and CocoaPods (iOS)
- Android Studio with JDK 17 (Android)

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

3. Set your credentials in `App.tsx`:
   ```ts
   const applicationId = '<YOUR_APPLICATION_ID>';
   const sessionId = '<YOUR_SESSION_ID>';
   const token = '<YOUR_TOKEN>';
   ```

## Run

- **iOS:** `npm run ios`
- **Android:** `npm run android`

Tap **Start outgoing call** or **Simulate incoming call**, then **Hang up**.

## Further reading

- [Vonage Video React Native SDK](https://vonage.github.io/video-docs/video-react-native-reference/latest)
- [react-native-callkeep](https://github.com/react-native-webrtc/react-native-callkeep)
- [CallKit](https://developer.apple.com/documentation/callkit)
- [Building a calling app on Android](https://developer.android.com/develop/connectivity/telecom)
