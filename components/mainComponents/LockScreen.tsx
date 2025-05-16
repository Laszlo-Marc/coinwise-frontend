import * as LocalAuthentication from "expo-local-authentication";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Button, Platform, Text, View } from "react-native";

export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [isChecking, setIsChecking] = useState(true);
  const [authFailed, setAuthFailed] = useState(false);

  useEffect(() => {
    const authenticate = async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      if (!compatible || !enrolled) {
        console.warn("No biometric hardware or not enrolled");
        setIsChecking(false);
        return;
      }

      const supportedTypes =
        await LocalAuthentication.supportedAuthenticationTypesAsync();
      console.log("Supported biometric types:", supportedTypes);

      const options = {
        promptMessage: "Unlock App",
        fallbackLabel: "Use Passcode",
      };

      if (
        Platform.OS === "ios" &&
        supportedTypes.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
        )
      ) {
        // iOS-specific handling for Face ID
        options.promptMessage = "Unlock with Face ID";
      }

      try {
        const result = await LocalAuthentication.authenticateAsync(options);

        if (result.success) {
          onUnlock();
        } else {
          setAuthFailed(true);
        }
      } catch (error) {
        console.error("Authentication error", error);
        setAuthFailed(true);
      }

      setIsChecking(false);
    };

    authenticate();
  }, []);

  if (isChecking) return <ActivityIndicator />;

  if (authFailed)
    return (
      <View>
        <Text>Authentication failed</Text>
        <Button title="Retry" onPress={() => setIsChecking(true)} />
      </View>
    );

  return null;
}
