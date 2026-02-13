// --- IMPORTS ---
import { useRouter } from "expo-router"; // Navigation hook to move between screens
import { Image, Text, TextInput, TouchableOpacity, View, Alert } from "react-native"; // Core UI components
import { BACKGROUND_COLOR, WHITE_TEXT_COLOR, ORANGE_COLOR, SECONDARY_BACKGROUND_COLOR } from "../constants/colors"; // Custom theme constants
import { Keyboard, TouchableWithoutFeedback } from "react-native"; // Utils to handle keyboard behavior
import React, { useState } from "react"; // React hooks for state management
import { supabase } from "../../../lib/supabase"; // Your Supabase client instance

export default function Register() {
  const router = useRouter(); // Initialize the router for navigation (back/push)

  // --- STATE VARIABLES ---
  const [username, setUsername] = useState(""); // Stores user's chosen display name
  const [email, setEmail] = useState("");       // Stores user's email address
  const [password, setPassword] = useState(""); // Stores user's password
  const [loading, setLoading] = useState(false); // Tracks if the sign-up process is active (for button disabling)
  
  // --- SIGN UP LOGIC ---
  async function signUpWithEmail() {
    setLoading(true) // Start loading state

    // 1. Attempt to create a user in Supabase Authentication
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { username } // Stores the username in the auth metadata
      },
    });

    // Handle authentication errors (e.g., email already taken, weak password)
    if (error) {
      Alert.alert(error.message);
    }

    const user = data.user;
    // 2. If Auth was successful, save the user info to your public 'users' table
    if (user) {
      const { error: insertError } = await supabase.from("users").insert({
        id: user.id,      // Links the Auth ID to your table record
        email: user.email,
        name: username,
      })

      // Handle database insertion errors
      if (insertError) {
        Alert.alert(insertError.message);
      } else
      {//--- ROUTE TO HOMEPAGE---
        router.replace("/(main_navigation)/(interactive_map)/HomeScreen");
        
      }
    }

    setLoading(false); // End loading state
  }

  return (
    /* Dismisses keyboard when clicking anywhere outside an input */
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{flex:1}}>

            {/* Main Background Container */}
            <View
              style={{
                flex: 1,
                backgroundColor: "#050E2D",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
                {/* Back Button: Uses router to go to previous screen */}
                <TouchableOpacity onPress={ () => router.back()}>
                    <Text style={{color: "white", fontSize: 20}}>Go Back</Text>
                </TouchableOpacity>

              {/* The "Card" UI that holds the form */}
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
                {/* App Logo Image */}
                <Image
                  source={require("../../../assets/images/traveleaglelogo.png")}
                  style={{
                    width: 150,
                    height: 150,
                    marginBottom: 15,
                    marginTop: -40
                  }}
                />

                {/* Title Text with nested spans for different colors */}
                <Text
                  style={{
                    color: "white",
                    fontSize: 30,
                    fontWeight: "600",
                    marginBottom: 5,
                    transform:[{translateY: -20}]
                  }}
                >
                    <Text style={{ color: WHITE_TEXT_COLOR }}>Join Travel</Text>
                    <Text style={{ color: ORANGE_COLOR }}>Eagle</Text>
                </Text>

                {/* Subtitle Text */}
                <Text
                  style={{
                    color: "#B0C4DE",
                    fontSize: 17,
                    marginBottom: 25,
                    transform:[{translateY: -17}]
                  }}
                >
                  Start your travel adventure today
                </Text>

                {/* USERNAME INPUT SECTION */}
                <View style={{ width: "100%", marginBottom: 15 }}>
                  <Text style={{ color: "#B0C4DE", fontSize: 16, marginBottom: 5 }}>Username</Text>
                  <TextInput
                    value={username}
                    onChangeText={setUsername} // Updates username state on every keystroke
                    placeholder="johndoe02"
                    placeholderTextColor="#A0AEC0"
                    style={{
                      backgroundColor: "#1E3A66",
                      borderRadius: 10,
                      paddingVertical: 12,
                      paddingHorizontal: 15,
                      color: "white",
                    }}
                  />
                </View>

                {/* EMAIL INPUT SECTION */}
                <View style={{ width: "100%", marginBottom: 15 }}>
                  <Text style={{ color: "#B0C4DE", fontSize: 16, marginBottom: 5 }}>Email</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail} // Updates email state
                    autoCapitalize="none" // Prevents auto-capitalizing the first letter
                    keyboardType="email-address" // Shows @ symbol on the keyboard
                    placeholder="you@example.com"
                    placeholderTextColor="#A0AEC0"
                    style={{
                      backgroundColor: "#1E3A66",
                      borderRadius: 10,
                      paddingVertical: 12,
                      paddingHorizontal: 15,
                      color: "white",
                    }}
                  />
                </View>

                {/* PASSWORD INPUT SECTION */}
                <View style={{ width: "100%", marginBottom: 25 }}>
                  <Text style={{ color: "#B0C4DE", fontSize: 16, marginBottom: 5 }}>Password</Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword} // Updates password state
                    placeholder="******"
                    placeholderTextColor="#A0AEC0"
                    secureTextEntry // Hides text for security
                    style={{
                      backgroundColor: "#1E3A66",
                      borderRadius: 10,
                      paddingVertical: 12,
                      paddingHorizontal: 15,
                      color: "white",
                    }}
                  />
                </View>

                {/* SIGN UP SUBMIT BUTTON */}
                <TouchableOpacity
                    onPress={signUpWithEmail} // Triggers the Supabase logic above
                    disabled={loading} // Prevents double-clicking while processing
                    style={{
                    backgroundColor: "#3B5BDB",
                    width: "100%",
                    paddingVertical: 14,
                    borderRadius: 12,
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                    Sign Up
                  </Text>
                </TouchableOpacity>

                {/* FOOTER: Navigation to Sign In screen */}
                <Text style={{ color: "#B0C4DE", fontSize: 15 }}>
                  Already have an account?{" "}
                  <TouchableOpacity onPress={() => router.push("../(authentication)/SignUpScreen")}>
                    <Text style={{ color: ORANGE_COLOR, fontWeight: "600", textDecorationLine: "underline"}}>
                    Sign In
                  </Text>
                  </TouchableOpacity>
                </Text>
              </View>
            </View>
        </View>
    </TouchableWithoutFeedback>
  );
}