import {Text, Image, View, TouchableOpacity, StyleSheet } from "react-native";
import { BACKGROUND_COLOR, WHITE_TEXT_COLOR, ORANGE_COLOR, SECONDARY_BACKGROUND_COLOR, SEARCH_BACKGROUND_COLOR } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AntDesign from '@expo/vector-icons/AntDesign';
import { useState } from "react";
import { TextInput } from "react-native-gesture-handler";

export default function intineraryPage() {
    const router = useRouter();
    const [isInputMode, setIsInputMode] = useState(false);
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: BACKGROUND_COLOR}}>
            {/* Logo, Title and new itinerary button */}
            <View style={{ 
                backgroundColor: BACKGROUND_COLOR,
                flexDirection: "row", 
                alignItems: "center", 
                paddingLeft: 20,
                paddingRight: 20, 
                paddingTop: 0, 
                paddingBottom: 20,
                justifyContent: "space-between" 
                }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                    source={require("../../../../assets/images/traveleaglelogo.png")}
                    style={{
                        width: 50,
                        height: 50,
                        marginRight: 10,
                    }}
                />
                <Text
                    style={{
                        fontSize: 30,
                        fontWeight: "600",
                        color: WHITE_TEXT_COLOR,
                    }}
                >
                    My Itineraries
                </Text>
            </View>

                <TouchableOpacity
                    onPress={() => setIsInputMode(!isInputMode)}
                    
                    style={{
                        backgroundColor: SECONDARY_BACKGROUND_COLOR,
                        paddingVertical: 10,
                        paddingHorizontal: 10,
                        borderRadius: 4,
                        alignItems: "center",
                    }}
                >
                  <AntDesign name="plus" size={36} color="white" />  
                </TouchableOpacity>
            </View>

            <View style={{ 
                flex: 1, 
                backgroundColor: SECONDARY_BACKGROUND_COLOR, 
                justifyContent: "center", 
                alignItems: "center", 
                paddingHorizontal: 15
                }}>
                {isInputMode ? (
                    // Show text input when in input mode
                    <View style={{ 
                        width: "100%", 
                        alignItems: "center",
                        backgroundColor: SECONDARY_BACKGROUND_COLOR 
                    }}>
                        <TextInput
                            placeholder="Enter itinerary name"
                            placeholderTextColor="#999"
                            style={{
                                width: "100%",
                                borderWidth: 2,
                                borderColor: ORANGE_COLOR,
                                borderRadius: 10,
                                padding: 15,
                                marginBottom: 15,
                                fontSize: 16,
                                backgroundColor: "#fff",
                                color: "#000",
                            }}
                        />
                        <TouchableOpacity
                            onPress={() => setIsInputMode(false)}
                            style={{
                                backgroundColor: ORANGE_COLOR,
                                width: "100%",
                                paddingVertical: 20,
                                borderRadius: 15,
                                alignItems: "center",
                                marginBottom: 15,
                            }}
                        >
                            <Text style={{ fontSize: 14.5, fontWeight: "900", color: "white" }}>Create</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    // Show buttons when NOT in input mode
                    <>
                        <TouchableOpacity
                            onPress={() => router.push("/(main_navigation)/(itinerary)/AiItineraryMaker")}
                            style={{
                                backgroundColor: SECONDARY_BACKGROUND_COLOR,
                                paddingVertical: 20,
                                borderRadius: 15,
                                alignItems: "center",
                                marginBottom: 15,
                            }}
                        >
                            <AntDesign name="calendar" size={74} color={SEARCH_BACKGROUND_COLOR} />
                            <Text style={{ fontSize: 18.5, fontWeight: "700", color: SEARCH_BACKGROUND_COLOR }}>No itineraries yet</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push("/(main_navigation)/(itinerary)/AiItineraryMaker")}
                            style={{
                                backgroundColor: ORANGE_COLOR,
                                width: "100%",
                                paddingVertical: 20,
                                borderRadius: 15,
                                alignItems: "center",
                                marginBottom: 15,
                            }}
                        >
                            <Text style={{ fontSize: 14.5, fontWeight: "900", color: "white" }}>Create Itinerary with AI</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push("/(main_navigation)/(itinerary)/ItineraryChoose")}
                            style={{
                                backgroundColor: "blue",
                                width: "100%",
                                paddingVertical: 20,
                                borderRadius: 15,
                                alignItems: "center",
                                marginBottom: 15,
                            }}
                        >
                            <Text style={{ fontSize: 14.5, fontWeight: "900", color: "white" }}>Create Manually</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </SafeAreaView>
    )
}
