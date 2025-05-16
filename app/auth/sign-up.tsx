import { useAuth } from "@/contexts/AuthContext";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../constants/colors";

const validatePassword = (password: string) => {
  const errors = [];
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  return errors;
};

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [emailValid, setEmailValid] = useState(true);
  const { signUp, checkUserExists } = useAuth();

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleEmailBlur = async () => {
    if (!email) return;

    const isValidFormat = validateEmail(email);
    setEmailValid(isValidFormat);

    if (isValidFormat) {
      try {
        const exists = await checkUserExists(email);
        if (exists) {
          Alert.alert(
            "Email Already Registered",
            "This email is already in use. Please use a different email or try signing in."
          );
        }
      } catch (error) {
        console.error("Error checking email:", error);
      }
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordErrors(validatePassword(text));
  };

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !fullName) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    const errors = validatePassword(password);
    if (errors.length > 0) {
      Alert.alert("Password Requirements", errors.join("\n"));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password, fullName);
      Alert.alert(
        "Success",
        "Please check your email to confirm your account",
        [{ text: "OK", onPress: () => router.replace("./sign-in") }]
      );
    } catch (error) {
      // Handle specific error cases
      if (error instanceof Error && error.message?.includes("already exists")) {
        Alert.alert(
          "Account Already Exists",
          "An account with this email already exists. Would you like to sign in instead?",
          [
            { text: "No", style: "cancel" },
            { text: "Yes", onPress: () => router.replace("./sign-in") },
          ]
        );
      } else {
        Alert.alert(
          "Sign Up Failed",
          error instanceof Error
            ? error.message
            : "An error occurred during sign up"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Create Account</Text>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              onBlur={handleEmailBlur}
              placeholder="Enter your email"
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.input,
                !emailValid && email ? styles.inputError : null,
              ]}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            {!emailValid && email && (
              <Text style={styles.errorText}>
                Please enter a valid email address
              </Text>
            )}
          </View>

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
              keyboardType="default"
              autoCapitalize="words"
              editable={!loading}
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={handlePasswordChange}
              placeholder="Enter your password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              style={[
                styles.input,
                passwordErrors.length > 0 && password
                  ? styles.inputError
                  : null,
              ]}
              editable={!loading}
            />
          </View>

          {/* Password strength indicators */}
          {password ? (
            <View style={styles.passwordIndicators}>
              <Text
                style={[
                  styles.passwordIndicator,
                  password.length >= 8
                    ? styles.validIndicator
                    : styles.invalidIndicator,
                ]}
              >
                • At least 8 characters
              </Text>
              <Text
                style={[
                  styles.passwordIndicator,
                  /[A-Z]/.test(password)
                    ? styles.validIndicator
                    : styles.invalidIndicator,
                ]}
              >
                • Uppercase letter
              </Text>
              <Text
                style={[
                  styles.passwordIndicator,
                  /[a-z]/.test(password)
                    ? styles.validIndicator
                    : styles.invalidIndicator,
                ]}
              >
                • Lowercase letter
              </Text>
              <Text
                style={[
                  styles.passwordIndicator,
                  /[0-9]/.test(password)
                    ? styles.validIndicator
                    : styles.invalidIndicator,
                ]}
              >
                • Number
              </Text>
            </View>
          ) : null}

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              style={[
                styles.input,
                confirmPassword && password !== confirmPassword
                  ? styles.inputError
                  : null,
              ]}
              editable={!loading}
            />
            {confirmPassword && password !== confirmPassword && (
              <Text style={styles.errorText}>Passwords do not match</Text>
            )}
          </View>

          <TouchableOpacity
            onPress={handleSignUp}
            style={[
              styles.button,
              (loading || passwordErrors.length > 0) && styles.disabledButton,
            ]}
            disabled={loading || passwordErrors.length > 0}
          >
            <Text style={styles.buttonText}>
              {loading ? "Creating account..." : "Sign Up"}
            </Text>
          </TouchableOpacity>

          <Link href="./sign-in" asChild>
            <TouchableOpacity>
              <Text style={styles.signInLink}>
                Already have an account? Sign in
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  innerContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  formContainer: {
    flex: 1,
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 40,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    color: colors.text,
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundLight,
    color: colors.text,
    fontSize: 16,
    paddingVertical: 8,
  },
  inputError: {
    borderBottomColor: "red",
    borderBottomWidth: 1,
  },
  errorText: {
    color: "red",
    marginTop: 4,
    fontSize: 12,
  },
  passwordIndicators: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  passwordIndicator: {
    fontSize: 12,
  },
  validIndicator: {
    color: colors.primary[400],
  },
  invalidIndicator: {
    color: "gray",
  },
  button: {
    backgroundColor: colors.primary[600],
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 16,
  },
  signInLink: {
    color: colors.primary[400],
    textAlign: "center",
  },
});
