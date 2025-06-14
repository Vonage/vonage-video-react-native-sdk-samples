# Basic Video Chat sample

This sample application shows how to connect to an OpenTok session, publish a stream, and subscribe to multiple streams for both iOS and Android using the OpenTok React Native SDK.

## Setup

1. Install the required node modules: `npm install`.

2. Install the required Gems: `bundle install`.

3. For iOS, install the Podfile's dependencies: `cd ios/ && bundle exec pod install`.

4. In the App.js file, set the `applicationId`, `sessionId`, and `token` properties to your Vonage Video application ID, a Vonage Video session ID, and a token for that session.

Run the app:

* For Android: `npm run android`

* For iOS: `npm run ios`

For testing, you can use the [OpenTok playground](https://tokbox.com/developer/tools/playground/) to create sessions, publish streams from a web client, and subscribe to streams published from the client using the OpenTok React Native SDK.

## Understanding the code

The App.js file includes all of the code that uses the OpenTok React Native SDK.

The app imports `OTSession`, `OTPublisher`, and `OTSubscriber` from the SDK.

```js
import {OTSession, OTPublisher, OTSubscriber} from '@vonage/client-sdk-video-react-native';
```

Documentation for these components are at <https://vonage.github.io/video-docs/video-react-native-reference/latest>.

This application shows the simplest way to publish and subscribe to audio-video streams in an OpenTok session. Simply add the  `applicationId`, `sessionId`, and `token` attributes to an `OTSession` component and add `OTPublisher` and `OTSubscriber` components as children of the  `OTSession` component:

```jsx
<OTSession
  applicationId={this.applicationId}
  sessionId={this.sessionId}
  token={this.token}>
  <OTPublisher style={{width: 200, height: 200}} />
  <OTSubscriber style={{width: 200, height: 200}} />
</OTSession>
```

The `OTSession` component connects to the specified OpenTok session. Upon connecting to the session, it publishes a stream to the session and subscribes to streams published by other clients connected to the session. The `OTSession` component includes a React Native `View` that automatically lays out the publisher and subscriber views in a grid.

Check out the OpenTok documentation at <https://tokbox.com/developer/>
