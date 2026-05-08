import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Alert} from "react-native";
import { BACKGROUND_COLOR, ORANGE_COLOR, WHITE_TEXT_COLOR } from "../constants/colors";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import { useAuth } from "../(authentication)/Auth";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";




export default function Onboarding(){

    const {user} = useAuth();
    const interests = [
        {label: "🍔 Food & Dining", value: "food"},
        {label: "🥾 Hiking & Trails", value: "hiking"},
        {label: "🏛️ Musuems", value: "Musuems"},
        {label: "🏖️ Beaches", value: "beaches"},
        {label: "🛍️ Shopping", value: "shopping"},
        {label: "📍 History & Landmarks", value: "history"},
        {label: "🎨 Art", value: "art"},
        {label: "🏗️ Architecture", value: "architecture"},
        {label: "📸 Photography", value: "photography"},
        {label: "🌱 Nature", value: "nature"},
        {label: "☕️ Coffee", value: "Coffee"},
        {label: "🌭 Street Food", value: "street food"},
        {label: "🌚 Nightlife", value: "nightlife"},
        {label: "⛷️ Adventure Sports", value: "adventure sports"},
        {label: "🚶 Walking Tours", value: "walking tours"},
        {label: "🌁 Scenic Views", value: "scenic views"},
        {label: "🎶 Live Music", value: "live music"},
    ]
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([
        {label: "🐌 Relaxed (3-4 activities per day)", value: "Relaxed (3-4 activities per day)"},
        {label: "🚶‍♂️ Moderate (5-6 activities per day)", value: "Moderate (5-6 activities per day)"},
        {label: "🏃‍♂️ Packed (7-8 activities per day)", value: "Packed (7-8 activities per day)" },
    ]); 
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [selectedPace, setSelectedPace] = useState("Moderate (5-6 activities per day)");
    const handleInterests = (value: string) => {
        if (selectedInterests.includes(value)){
            setSelectedInterests(selectedInterests.filter(i => i !== value));
        }
        else{
            setSelectedInterests([...selectedInterests, value]);
        }
    };

    async function handleSave(){
        if(selectedInterests.length < 3){
            Alert.alert("Select at least 3 interests");
            return;
        }

        const { error } = await supabase
        .from("users")
        .update({interests: selectedInterests, pace: selectedPace })
        .eq("id", user.id)

       if (error) {
        console.error("Failed to save", error);
        Alert.alert("Error", "Failed to save Preferences");
        return;
       } 

       router.replace("/HomeScreen");
    }


    return(
       <SafeAreaView style={{ flex: 1, backgroundColor: BACKGROUND_COLOR }}>
               
                <View style={{flex:1}}>
                <View style={{padding: 20, marginTop: 30}}>
                <Text style={{fontSize: 20, fontWeight: 500, fontFamily: "Inter", alignSelf: 'center', alignContent: 'center', color: ORANGE_COLOR}}>Select your interests.</Text>
                <Text style={{fontSize: 14, fontFamily: "Inter", fontWeight: 300, color: WHITE_TEXT_COLOR, alignSelf: "center"}}>Please select at least three to proceed.</Text>
                </View>
                <View style={{flexDirection: "row", flexWrap: "wrap", gap: 10, padding: 15}}>
                    {interests.map((interest)=>(
                        <TouchableOpacity
                        key={interest.value}
                        onPress={()=>handleInterests(interest.value)}
                        style={{borderRadius:20, backgroundColor: selectedInterests.includes(interest.value) ? ORANGE_COLOR : WHITE_TEXT_COLOR, padding:12
                        }}
                        >
                            <Text style={{color: "black", fontSize: 12}}> {interest.label}</Text>
                        </TouchableOpacity>
                    ))}</View>
                <Text style={{fontSize: 20, fontWeight: 500, fontFamily: "Inter", alignSelf: 'center', alignContent: 'center', color: ORANGE_COLOR, marginTop: 15, marginBottom: 15}}>Preferred Pace</Text>
                <View style={{padding:12}}>
                <DropDownPicker
                    open={open}
                    value={selectedPace}
                    items={items}
                    setOpen={setOpen}
                    setValue={setSelectedPace}
                    setItems = {setItems}
                    placeholder={'Select a pace'}
                    listMode="SCROLLVIEW"
                    style={styles.tripPicker}
                    dropDownContainerStyle={styles.tripPickerDropdown}
                    textStyle={styles.tripPickerText}
                    placeholderStyle={styles.tripPickerPlaceholder}
                >

                </DropDownPicker>
                </View>
                <View style={{flexDirection: "column-reverse", flex:1, padding: 20}}>
                <TouchableOpacity 
                onPress={handleSave}
                style={{backgroundColor: ORANGE_COLOR, paddingVertical:10, borderRadius: 10, alignItems: "center", justifyContent: "center", flexDirection: "row", gap:8,}}>
                    <Text style={{fontFamily: 'Inter', fontSize: 16, color: WHITE_TEXT_COLOR, fontWeight: 700,}}>Continue</Text>
                    <Ionicons name="arrow-forward" size={20} color="white"></Ionicons>
                </TouchableOpacity>
                </View>
               </View>

        </SafeAreaView>
       
    );
}

const styles = StyleSheet.create({
      tripPicker: {
    backgroundColor: WHITE_TEXT_COLOR,
    borderColor: '#0A1A31',
    borderRadius: 4,
    marginBottom: 20,
    minHeight: 48,
  },
  tripPickerDropdown: {
    backgroundColor: WHITE_TEXT_COLOR,
    borderColor: '#0A1A31',
  },
  tripPickerText: {
    color: 'black',
    fontSize: 14,
  },
  tripPickerPlaceholder: {
    color: 'black',
    fontSize: 14,
  },
})
