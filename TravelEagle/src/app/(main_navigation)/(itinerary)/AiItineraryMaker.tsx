import {
  Text,
  Image,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  BACKGROUND_COLOR,
  WHITE_TEXT_COLOR,
  ORANGE_COLOR,
  SECONDARY_BACKGROUND_COLOR,
  SEARCH_BACKGROUND_COLOR,
} from "../../constants/colors";

import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";


export default function HomeScreen()
{
    const [value, setValue] = useState([]);
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([
        { label: "Exciting", value: "exciting" },
        { label: "Relaxing", value: "relaxing" },
        { label: "Nature", value: "nature" },
        { label: "Romatic", value: "romantic" },
        { label: "Food", value: "food" },
        { label: "Culture", value: "culture" },
    ]);
    const [inputText, setInputText] = useState("");
    const [messages, setMessages] = useState<string[]>([]);
   const router = useRouter();
   return(
    <SafeAreaView style={{ flex: 1, backgroundColor: BACKGROUND_COLOR }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#7691bc' }}>
            <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}
                onPress={() => router.back()}
            >
                <Ionicons name="arrow-back" size={24} color={WHITE_TEXT_COLOR} />
                <Text style={{ color: WHITE_TEXT_COLOR, fontSize: 16, marginLeft: 5 }}>
                    Back to Itineraries
                </Text>
            </TouchableOpacity>
            
            <Text
                style={{
                    fontSize: 30,
                    fontWeight: "600",
                    color: WHITE_TEXT_COLOR,
                }}>
                AI Itinerary Maker
            </Text>
        </View>

        {/* Dropdown Menu */}
        <View style={{ zIndex: 1000, position: 'relative', paddingHorizontal: 20, marginBottom: 20, height: 60, justifyContent: 'center' }}>
            <DropDownPicker
                multiple={true}   
                min={0}
                max={8} 
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setItems}
                style={{ backgroundColor: BACKGROUND_COLOR, borderWidth: 0, height: 50, justifyContent: 'center' }}
                textStyle={{ color: WHITE_TEXT_COLOR, fontWeight: 'bold', lineHeight: 24 }}
                dropDownContainerStyle={{ backgroundColor: SEARCH_BACKGROUND_COLOR, zIndex: 1000, maxHeight: 300 }}
                placeholder="What's your vibe?"
                zIndex={1000}
                zIndexInverse={1000}
                dropDownDirection="AUTO"
                showTickIcon={true}
                tickIconStyle={{ tintColor: WHITE_TEXT_COLOR }}
                showArrowIcon={true}
                arrowIconStyle={{ tintColor: WHITE_TEXT_COLOR }}
            />
        </View>

        {/* Main Content */}
        <View style={{ flex: 1, justifyContent: "flex-start", alignItems: "center" }}>

        <View style={{ flex: 1, width: "100%", backgroundColor: SECONDARY_BACKGROUND_COLOR, justifyContent: "flex-start", alignItems: "center", borderTopWidth: 1, borderBottomWidth: 1, borderTopColor: '#7691bc', borderBottomColor: '#7691bc' }}>
            <ScrollView contentContainerStyle={{ paddingVertical: 16, width: "100%", alignItems: "flex-end", justifyContent: "flex-start" }}>
                {messages.map((message, index) => (
                    <View key={index} style={{ alignSelf: "flex-end", backgroundColor: "#2c4eb5", borderRadius: 16, padding: 14, marginBottom: 12, marginRight: 20, maxWidth: "85%" }}>
                        <Text style={{ color: WHITE_TEXT_COLOR, fontSize: 16, lineHeight: 22 }}>
                            {message}
                        </Text>
                    </View>
                ))}
            </ScrollView>
        </View>

        </View>

        {/* Input and Send Button at Bottom */}
        <View
            style={{display: "flex", flexDirection: "row", justifyContent: "center", height: 60 }}>
            <TextInput
                placeholder="Tell me about your ideal day."
                placeholderTextColor="gray"
                value={inputText}
                onChangeText={setInputText}
                style={{ flex: 1, backgroundColor: SEARCH_BACKGROUND_COLOR, color: WHITE_TEXT_COLOR, paddingHorizontal: 15, margin: 10, borderRadius: 5 }}>
            </TextInput>

            <TouchableOpacity
                onPress={() => {
                    const trimmed = inputText.trim();
                    if (trimmed.length > 0) {
                        setMessages(prev => [...prev, trimmed]);
                        setInputText("");
                    }
                }}
                style={{ backgroundColor: "#2c4eb5", paddingHorizontal: 15, margin: 10, borderRadius: 5, justifyContent: 'center' }}>
                <Text style={{ color: WHITE_TEXT_COLOR, fontWeight: "900", fontSize: 16 }}>Send</Text>
            </TouchableOpacity>
        </View>

        <View>
            {/* After receieving response, add an import itinerary button */}

        </View>

    
    </SafeAreaView>
    
    
    
    
    
    )

}