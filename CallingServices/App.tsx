import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  OTPublisher,
  OTSession,
  OTSubscriber,
  enableCallingServicesMode,
  isCallingServicesModeAvailable,
  notifyAudioFocusActivated,
  notifyAudioFocusDeactivated,
  notifyAudioSessionActivated,
  notifyAudioSessionDeactivated,
  preconfigureAudioSessionForCall,
  setRequestAudioFocus,
} from '@vonage/client-sdk-video-react-native';

// Replace with your own credentials.
const applicationId = '';
const sessionId = '';
const token = '';

const CALLER_HANDLE = 'Vonage Video';

// CallKit / Telecom need a UUID per call. Math.random is fine for a sample;
// use a crypto-backed generator in production.
const uuidv4 = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.floor(Math.random() * 16);
    return (c === 'x' ? r : (r % 4) + 8).toString(16);
  });

const callKeepOptions = {
  ios: {
    appName: 'CallingServices',
    supportsVideo: true,
    maximumCallGroups: '1',
    maximumCallsPerCallGroup: '1',
  },
  android: {
    alertTitle: 'Permissions required',
    alertDescription: 'This app needs access to your phone accounts',
    cancelButton: 'Cancel',
    okButton: 'OK',
    additionalPermissions: [],
    // The app owns the call UI; Telecom only arbitrates audio and lifecycle.
    selfManaged: true,
  },
};

function CallScreen(): React.JSX.Element {
  const [callId, setCallId] = useState<string | null>(null);
  const [inCall, setInCall] = useState(false);
  // Android self-managed mode: the app renders its own ringing UI.
  const [ringingCallId, setRingingCallId] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const callIdRef = useRef<string | null>(null);

  const addLog = useCallback((line: string) => {
    console.log(`[CallingServices] ${line}`);
    setLog(prev => [line, ...prev].slice(0, 30));
  }, []);

  const run = useCallback(
    async (label: string, fn: () => Promise<unknown>) => {
      try {
        const value = await fn();
        addLog(`${label}: ok${value == null ? '' : ` ${value}`}`);
      } catch (e: any) {
        addLog(`${label}: ${e?.code ?? 'error'} ${e?.message ?? e}`);
      }
    },
    [addLog],
  );

  // The call is answered (incoming) or started (outgoing): join the session.
  const beginCall = useCallback(
    async (uuid: string) => {
      // iOS: configure the AVAudioSession before CallKit activates it.
      await run('preconfigureAudioSessionForCall', () =>
        preconfigureAudioSessionForCall(),
      );
      callIdRef.current = uuid;
      setRingingCallId(null);
      setCallId(uuid);
      setInCall(true);
      if (Platform.OS === 'android') {
        // Android: Telecom has granted the call audio focus.
        await run('notifyAudioFocusActivated', notifyAudioFocusActivated);
        RNCallKeep.setCurrentCallActive(uuid);
      }
    },
    [run],
  );

  const finishCall = useCallback(async () => {
    setRingingCallId(null);
    setInCall(false);
    setCallId(null);
    callIdRef.current = null;
    if (Platform.OS === 'android') {
      await run('notifyAudioFocusDeactivated', notifyAudioFocusDeactivated);
    }
  }, [run]);

  useEffect(() => {
    (async () => {
      await run(
        'isCallingServicesModeAvailable',
        isCallingServicesModeAvailable,
      );
      // iOS: the SDK stops activating AVAudioSession itself; CallKit does it.
      await run('enableCallingServicesMode', enableCallingServicesMode);
      // Android: the SDK stops requesting audio focus itself; Telecom does it.
      await run('setRequestAudioFocus(false)', () =>
        setRequestAudioFocus(false),
      );
      try {
        await RNCallKeep.setup(callKeepOptions);
        RNCallKeep.setAvailable(true);
        addLog('CallKeep ready');
      } catch (e: any) {
        addLog(`CallKeep setup failed: ${e?.message ?? e}`);
      }
    })();

    RNCallKeep.addEventListener('didReceiveStartCallAction', ({ callUUID }) => {
      addLog('CallKeep: start call');
      const uuid = callUUID ?? callIdRef.current;
      if (uuid) {
        beginCall(uuid).then(() =>
          RNCallKeep.reportConnectedOutgoingCallWithUUID(uuid),
        );
      }
    });
    RNCallKeep.addEventListener(
      'didDisplayIncomingCall',
      ({ error, errorCode }) => {
        addLog(
          error
            ? `CallKeep: incoming call rejected (${errorCode}) ${error}`
            : 'CallKeep: incoming call shown',
        );
      },
    );
    RNCallKeep.addEventListener('showIncomingCallUi', ({ callUUID }) => {
      addLog('CallKeep: show incoming call UI');
      setRingingCallId(callUUID);
    });
    RNCallKeep.addEventListener('answerCall', ({ callUUID }) => {
      addLog('CallKeep: answer');
      beginCall(callUUID);
    });
    RNCallKeep.addEventListener('endCall', () => {
      addLog('CallKeep: end');
      finishCall();
    });
    // iOS only: CallKit owns activation of the audio session.
    RNCallKeep.addEventListener('didActivateAudioSession', () => {
      addLog('CallKeep: audio session activated');
      run('notifyAudioSessionActivated', notifyAudioSessionActivated);
    });
    RNCallKeep.addEventListener('didDeactivateAudioSession', () => {
      addLog('CallKeep: audio session deactivated');
      run('notifyAudioSessionDeactivated', notifyAudioSessionDeactivated);
    });

    return () => {
      RNCallKeep.removeEventListener('didReceiveStartCallAction');
      RNCallKeep.removeEventListener('didDisplayIncomingCall');
      RNCallKeep.removeEventListener('showIncomingCallUi');
      RNCallKeep.removeEventListener('answerCall');
      RNCallKeep.removeEventListener('endCall');
      RNCallKeep.removeEventListener('didActivateAudioSession');
      RNCallKeep.removeEventListener('didDeactivateAudioSession');
    };
  }, [addLog, beginCall, finishCall, run]);

  // In production an incoming call arrives as a VoIP push (iOS) or FCM data
  // message (Android) whose handler calls displayIncomingCall. This button
  // simulates that step locally.
  const simulateIncomingCall = () => {
    const uuid = uuidv4();
    callIdRef.current = uuid;
    RNCallKeep.displayIncomingCall(
      uuid,
      CALLER_HANDLE,
      CALLER_HANDLE,
      'generic',
      true,
    );
    addLog('displayIncomingCall');
  };

  const startOutgoingCall = () => {
    const uuid = uuidv4();
    callIdRef.current = uuid;
    RNCallKeep.startCall(uuid, CALLER_HANDLE, CALLER_HANDLE, 'generic', true);
    addLog('startCall');
  };

  const hangUp = () => {
    if (callId) {
      RNCallKeep.endCall(callId);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.buttons}>
        {ringingCallId ? (
          <>
            <Button
              title="Answer"
              onPress={() => RNCallKeep.answerIncomingCall(ringingCallId)}
            />
            <Button
              title="Decline"
              onPress={() => RNCallKeep.rejectCall(ringingCallId)}
            />
          </>
        ) : inCall ? (
          <Button title="Hang up" onPress={hangUp} />
        ) : (
          <>
            <Button
              title="Simulate incoming call"
              onPress={simulateIncomingCall}
            />
            <Button title="Start outgoing call" onPress={startOutgoingCall} />
          </>
        )}
      </View>
      {inCall && (
        <OTSession
          applicationId={applicationId}
          sessionId={sessionId}
          token={token}
          eventHandlers={{
            sessionConnected: () => addLog('session connected'),
            sessionDisconnected: () => addLog('session disconnected'),
            error: (e: any) => addLog(`session error ${e?.message ?? ''}`),
          }}
        >
          <View style={styles.videos}>
            <OTPublisher style={styles.video} />
            <OTSubscriber style={styles.video} />
          </View>
        </OTSession>
      )}
      <ScrollView style={styles.log}>
        {log.map((line, i) => (
          <Text key={i} style={styles.logLine}>
            {line}
          </Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  buttons: { gap: 8, marginBottom: 12 },
  videos: { flexDirection: 'row', gap: 8 },
  video: { width: 160, height: 200 },
  log: { flex: 1, marginTop: 12 },
  logLine: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <CallScreen />
    </SafeAreaProvider>
  );
}

export default App;
