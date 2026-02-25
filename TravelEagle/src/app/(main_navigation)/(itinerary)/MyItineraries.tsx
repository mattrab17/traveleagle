import {Text, Image, View, TouchableOpacity, StyleSheet } from "react-native";
import { BACKGROUND_COLOR, WHITE_TEXT_COLOR, ORANGE_COLOR } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function intineraryPage() {
    const router = useRouter();
    
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: BACKGROUND_COLOR}}>
            <View
                style={{
                    flex:1,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingTop: 40,
                }}
            />

            <Image
                source={require("../../../../assets/images/traveleaglelogo.png")}
                style={{
                    width: 50,
                    height: 50,
                    marginBottom: 0,
                    margin: 15,
                }}
            />
            {/* Title*/}
            <Text
                style={{
                    fontSize: 38,
                    fontWeight: "600",
                    marginTop: -20,
                }}
            >
                <Text style={{ color: WHITE_TEXT_COLOR }}>My Itineraries</Text>
            </Text>

            <View style={{ alignItems: "center", paddingBottom: 40}}>
                <TouchableOpacity //change this link so that it navigates to AI creation of itinerary
                    onPress={() => router.push("/(main_navigation)/(itinerary)/AiItineraryMaker")}
                    style={{
                        backgroundColor: ORANGE_COLOR,
                        width: "60%",
                        paddingVertical: 20,
                        borderRadius: 15,
                        alignItems: "center",
                        marginBottom: 15,
                    }}
                >
                  <Text style={{ fontSize: 14.5, fontWeight: "900", color: "white"}}>Create Itinerary with AI</Text>  
                </TouchableOpacity>

                <TouchableOpacity //change this link so that it navigates to manual creation of itinerary
                    onPress={() => router.push("/(main_navigation)/(itinerary)/ItineraryChoose")}
                    style={{
                        backgroundColor: "blue",
                        width: "60%",
                        paddingVertical: 20,
                        borderRadius: 15,
                        alignItems: "center",
                        marginBottom: 15,
                    }}
                >
                  <Text style={{ fontSize: 14.5, fontWeight: "900", color: "white"}}>Create Manually</Text>  
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}
