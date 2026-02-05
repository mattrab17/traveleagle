import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";
import { BACKGROUND_COLOR } from "../app/constants/colors";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      {/* ROOT BACKGROUND LAYER */}
      <View style={{ flex: 1, backgroundColor: BACKGROUND_COLOR }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: BACKGROUND_COLOR,
            },
          }}
        />
      </View>
    </SafeAreaProvider>
  );
}
