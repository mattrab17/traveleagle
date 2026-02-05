import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { BACKGROUND_COLOR, WHITE_TEXT_COLOR, ORANGE_COLOR } from "./constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BACKGROUND_COLOR }}>
      
      {/* Main Centered Content */}
      <View
        style={{
          flex: 1,
          marginTop: 100,
          alignItems: "center",
        }}
      >
        {/* Logo */}
        <View>
          <Image
          source={require("../../assets/images/traveleaglelogo.png")}
          style={{
            width: 310,
            height: 310,
            transform: [{ translateY: -100 }],
          }}
        />

        {/* Title */}
        <Text
          style={{
            fontSize: 67,
            fontWeight: "600",
            transform: [{ translateY: -120 }],
          }}
        >
          <Text style={{ color: WHITE_TEXT_COLOR }}>Travel</Text>
          <Text style={{ color: ORANGE_COLOR }}>Eagle</Text>
        </Text>

      </View>
        

        

        {/* Subtext */}
        <Text
          style={{
            fontSize: 26,
            color: WHITE_TEXT_COLOR,
            fontWeight: "200",
            transform: [{ translateY: -115 }],
          }}
        >
          Your smart travel companion
        </Text>
      </View>

      {/* Buttons */}
      <View style={{ alignItems: "center", paddingBottom: 40 }}>
        <TouchableOpacity
          style={{
            backgroundColor: "white",
            width: "85%",
            paddingVertical: 20,
            borderRadius: 15,
            alignItems: "center",
            marginBottom: 15,
          }}
        >
          <Text style={{ fontSize: 20 }}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(authentication)/Login")}
          style={{
            width: "85%",
            paddingVertical: 20,
            borderRadius: 15,
            borderColor: "white",
            borderWidth: 3,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 20, color: "white" }}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(main_navigation)/HomeScreen")}
          style={{ marginTop: 10 }}
        >
          <Text
            style={{
              textDecorationLine: "underline",
              color: WHITE_TEXT_COLOR,
              fontSize: 16,
            }}
          >
            To Home Page
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
