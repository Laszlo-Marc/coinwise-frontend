import { useAuth } from "@/contexts/AuthContext";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { colors } from "../../constants/colors";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password);
      Alert.alert(
        "Success",
        "Please check your email to confirm your account",
        [{ text: "OK", onPress: () => router.replace("./sign-in") }]
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message || "An error occurred during sign up"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 20 }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          maxWidth: 400,
          width: "100%",
          alignSelf: "center",
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: 32,
            fontWeight: "bold",
            marginBottom: 32,
          }}
        >
          Create Account
        </Text>
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: colors.text, marginBottom: 8 }}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor={colors.textSecondary}
            style={{
              backgroundColor: colors.backgroundLight,
              borderRadius: 8,
              padding: 16,
              color: colors.text,
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
        </View>
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: colors.text, marginBottom: 8 }}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            style={{
              backgroundColor: colors.backgroundLight,
              borderRadius: 8,
              padding: 16,
              color: colors.text,
            }}
            editable={!loading}
          />
        </View>
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: colors.text, marginBottom: 8 }}>
            Confirm Password
          </Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            style={{
              backgroundColor: colors.backgroundLight,
              borderRadius: 8,
              padding: 16,
              color: colors.text,
            }}
            editable={!loading}
          />
        </View>
        <TouchableOpacity
          onPress={handleSignUp}
          style={[
            {
              backgroundColor: colors.primary[600],
              padding: 16,
              borderRadius: 8,
              alignItems: "center",
              marginBottom: 16,
            },
            loading && { opacity: 0.7 },
          ]}
          disabled={loading}
        >
          <Text style={{ color: colors.text, fontWeight: "600" }}>
            {loading ? "Creating account..." : "Sign Up"}
          </Text>
        </TouchableOpacity>
        <Link href="./sign-in" asChild>
          <TouchableOpacity>
            <Text style={{ color: colors.primary[400], textAlign: "center" }}>
              Already have an account? Sign in
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}
