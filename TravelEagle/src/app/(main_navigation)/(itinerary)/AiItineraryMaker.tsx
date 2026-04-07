import {
  BACKGROUND_COLOR,
  WHITE_TEXT_COLOR,
  ORANGE_COLOR,
  SECONDARY_BACKGROUND_COLOR,
  SEARCH_BACKGROUND_COLOR,
} from "../../constants/colors";

import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

export default function HomeScreen()
{
   const router = useRouter();
   return(
    <SafeAreaView style={{ flex: 1, backgroundColor: BACKGROUND_COLOR }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text
                style={{
                    fontSize: 30,
                    fontWeight: "600",
                    color: WHITE_TEXT_COLOR,
                }}>
            AI Itinerary Maker
          </Text>
        </View>

    </SafeAreaView>
    
    
    
    
    
    )

}