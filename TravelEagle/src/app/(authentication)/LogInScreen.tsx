// --- IMPORTS ---
import { useRouter } from "expo-router"; // For navigating between auth and app screens
import { Image, Text, TextInput, TouchableOpacity, View, Alert, StyleSheet } from "react-native";
import { BACKGROUND_COLOR, WHITE_TEXT_COLOR, ORANGE_COLOR, SECONDARY_BACKGROUND_COLOR } from "../constants/colors";
import { Keyboard, TouchableWithoutFeedback } from "react-native"; // Utils to hide keyboard on tap
import React, { useState } from "react";
import { supabase } from "../../../lib/supabase"; // Import initialized Supabase client

export default function Login() {
  const router = useRouter(); // Hook to handle navigation actions

  // --- STATE MANAGEMENT ---
  const [email, setEmail] = useState("");      // Holds the email string
  const [password, setPassword] = useState(""); // Holds the password string
  const [loading, setLoading] = useState(false); // UI state to show processing/loading

  // --- LOGIN LOGIC ---
  async function signInWithEmail() {
    setLoading(true); // Start loading (disables button to prevent double-taps)

    // Attempt to sign in with Supabase Auth
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // If there's an error (wrong password, user doesn't exist), show an alert
    if (error) {
      Alert.alert("Login Failed", error.message);
    } else {
      // SUCCESS: ROUTE TO HOME PAGE
      router.replace("/(main_navigation)/(interactive_map)/HomeScreen");

    }
    
    setLoading(false); // Reset loading state regardless of outcome
  }

  return (
    /* Wrapping the screen in this allows users to dismiss the keyboard by tapping anywhere */
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{flex:1}}>

            {/* Main Container */}
            <View
              style={{
                flex: 1,
                backgroundColor: "#050E2D", // Matches your travel theme dark blue
                justifyContent: "center",
                alignItems: "center",
              }}
            >
                {/* Back Button: Useful for testing or returning to a landing page */}
                <TouchableOpacity onPress={ () => router.back()}>
                    <Text style={{color: "white", fontSize: 20}}>Go Back</Text>
                </TouchableOpacity>

              {/* Sign-In Card Container */}
              <View
                style={{
                  width: "92%",
                  backgroundColor: SECONDARY_BACKGROUND_COLOR,
                  borderRadius: 20,
                  borderColor: WHITE_TEXT_COLOR,
                  borderWidth: .2,
                  paddingVertical: 70,
                  paddingHorizontal: 30,
                  alignItems: "center",
                }}
              >
                {/* App Logo */}
                <Image
                  source={require("../../../assets/images/traveleaglelogo.png")}
                  style={{
                    width: 150,
                    height: 150,
                    marginBottom: 15,
                    marginTop: -40
                  }}
                />

                {/* Title */}
                <Text
                  style={{
                    color: "white",
                    fontSize: 30,
                    fontWeight: "600",
                    marginBottom: 5,
                    transform:[{translateY: -25}]
                  }}
                >
                  Welcome Back
                </Text>

                {/* Subtitle */}
                <Text
                  style={{
                    color: "#B0C4DE",
                    fontSize: 17,
                    marginBottom: 25,
                    transform:[{translateY: -22}]
                  }}
                >
                  Sign in to continue your journey
                </Text>

                {/* EMAIL INPUT */}
                <View style={{ width: "100%", marginBottom: 15 }}>
                  <Text style={{ color: "#B0C4DE", fontSize: 16, marginBottom: 5 }}>Email</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor="#A0AEC0"
                    autoCapitalize="none" // Important for emails
                    style={{
                      backgroundColor: "#1E3A66",
                      borderRadius: 10,
                      paddingVertical: 12,
                      paddingHorizontal: 15,
                      color: "white",
                    }}
                  />
                </View>

                {/* PASSWORD INPUT */}
                <View style={{ width: "100%", marginBottom: 25 }}>
                  <Text style={{ color: "#B0C4DE", fontSize: 16, marginBottom: 5 }}>Password</Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="******"
                    placeholderTextColor="#A0AEC0"
                    secureTextEntry // Obfuscates characters
                    style={{
                      backgroundColor: "#1E3A66",
                      borderRadius: 10,
                      paddingVertical: 12,
                      paddingHorizontal: 15,
                      color: "white",
                    }}
                  />
                </View>

                {/* SIGN IN BUTTON */}
                <TouchableOpacity
                  onPress={signInWithEmail}
                  disabled={loading} // Button is grayed out/unclickable if loading is true
                  style={{
                    backgroundColor: "#3B5BDB", // Nice contrast blue
                    width: "100%",
                    paddingVertical: 14,
                    borderRadius: 12,
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                    Sign In
                  </Text>
                </TouchableOpacity>

                {/* FOOTER: Link to Register if they don't have an account */}
                <Text style={{ color: "#B0C4DE", fontSize: 15 }}>
                  Don’t have an account?{" "}
                  <TouchableOpacity onPress={() => router.push("/(authentication)/SignUpScreen")}>
                    <Text style={{ color: ORANGE_COLOR, fontWeight: "600", textDecorationLine: "underline"}}>
                    Sign Up
                  </Text>
                  </TouchableOpacity>
                </Text>
              </View>
            </View>
        </View>
    </TouchableWithoutFeedback>
  );
}