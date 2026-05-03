import { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  BACKGROUND_COLOR,
  ORANGE_COLOR,
  SEARCH_BACKGROUND_COLOR,
} from "../../constants/colors";
import { AntDesign } from "@expo/vector-icons";
import { useAuth } from "../../(authentication)/Auth";
import { tripController } from "@/controllers/tripController";

export default function ItineraryGatePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkTrips() {
      if (!user?.id) {
        if (isMounted) setIsChecking(false);
        return;
      }

      const { data } = await tripController.loadAllTrips(user.id);
      if (!isMounted) return;

      if ((data?.length ?? 0) > 0) {
        router.replace("/(main_navigation)/TripList");
        return;
      }

      setIsChecking(false);
    }

    checkTrips();
    return () => {
      isMounted = false;
    };
  }, [router, user]);

  if (isChecking) {
    return <SafeAreaView style={{ flex: 1, backgroundColor: BACKGROUND_COLOR }} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BACKGROUND_COLOR }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
        }}
      >
        <Image
          source={require("../../../../assets/images/traveleaglelogo.png")}
          style={{ width: 72, height: 72, marginBottom: 16 }}
        />
        <AntDesign name="calendar" size={74} color={SEARCH_BACKGROUND_COLOR} />
        <Text
          style={{
            marginTop: 12,
            marginBottom: 20,
            fontSize: 18.5,
            fontWeight: "700",
            color: SEARCH_BACKGROUND_COLOR,
          }}
        >
          No trips yet
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/(main_navigation)/(itinerary)/AiItineraryMaker")}
          style={{
            backgroundColor: ORANGE_COLOR,
            width: "100%",
            paddingVertical: 18,
            borderRadius: 15,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 14.5, fontWeight: "900", color: "white" }}>
            Create Trip with AI
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/(main_navigation)/TripList",
              params: { openCreate: "1" },
            })
          }
          style={{
            backgroundColor: "#2c4eb5",
            width: "100%",
            paddingVertical: 18,
            borderRadius: 15,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 14.5, fontWeight: "900", color: "white" }}>
            Create Trip Manually
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
