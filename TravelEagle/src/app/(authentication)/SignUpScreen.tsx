import { useRouter } from "expo-router";
import { Image, Text, TextInput, TouchableOpacity, View, Alert  } from "react-native";
import { BACKGROUND_COLOR, WHITE_TEXT_COLOR, ORANGE_COLOR, SECONDARY_BACKGROUND_COLOR } from "../constants/colors";
import { Keyboard, TouchableWithoutFeedback } from "react-native"; //Allows user to press anywhere to drop the keyboard
import React, { useState } from "react";
import { supabase } from "../../../lib/supabase";


export default function Register() {
  const router = useRouter();

  const [username, setUsername] = useState(""); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
    async function signUpWithEmail() {
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });
    if (error) {
    Alert.alert(error.message);
  }

     const user = data.user;
     if (user) {
  const { error: insertError } = await supabase.from("users").insert({
  id: user.id,
  email: user.email,
  name: username,
})
    if (insertError) {
      Alert.alert(insertError.message);
    }
  }

  setLoading(false);
}

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{flex:1}}>

            <View
      style={{
        flex: 1,
        backgroundColor: "#050E2D",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
        {/* Temporary Navigation */}
        <TouchableOpacity onPress={ () => router.back()}>
            
            <Text style={{color: "white", fontSize: 20}}>
                Go Back
            </Text>
        </TouchableOpacity>
      {/* Sign in Card */}
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
        {/* Logo */}
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
            transform:[{translateY: -20}]
          }}
        >
                    <Text style={{ color: WHITE_TEXT_COLOR }}>Join Travel</Text>
                    <Text style={{ color: ORANGE_COLOR }}>Eagle</Text>


        </Text>

        {/* Subtitle */}
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


        {/* Username */}
        <View style={{ width: "100%", marginBottom: 15 }}>
          <Text
            style={{
              color: "#B0C4DE",
              fontSize: 16,
              marginBottom: 5,
            }}
          >
            Username
          </Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
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
        {/* Email */}
        <View style={{ width: "100%", marginBottom: 15 }}>
          <Text
            style={{
              color: "#B0C4DE",
              fontSize: 16,
              marginBottom: 5,
            }}
          >
            Email
          </Text>
          <TextInput
          value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
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

        {/* Password */}
        <View style={{ width: "100%", marginBottom: 25 }}>
          <Text
            style={{
              color: "#B0C4DE",
              fontSize: 16,
              marginBottom: 5,
            }}
          >
            Password
          </Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="******"
            placeholderTextColor="#A0AEC0"
            secureTextEntry
            style={{
              backgroundColor: "#1E3A66",
              borderRadius: 10,
              paddingVertical: 12,
              paddingHorizontal: 15,
              color: "white",
            }}
          />
        </View>

        {/* Sign In Button */}
        <TouchableOpacity
            onPress={signUpWithEmail}
            disabled={loading}
            style={{
            backgroundColor: "#3B5BDB",
            width: "100%",
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            Sign Up
          </Text>
        </TouchableOpacity>

        {/* Footer */}
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
