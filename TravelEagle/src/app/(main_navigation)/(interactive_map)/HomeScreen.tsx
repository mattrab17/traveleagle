import { router } from "expo-router";
import {View, Text, TouchableOpacity} from "react-native";

export default function HomeScreen(){
  return(

    <View style={{
      flex: 1,
      backgroundColor: "#050E2D",
      justifyContent: "center",
      alignItems: "center",}}>
      <Text> I am the home screen</Text>
      

      <TouchableOpacity
          onPress={() => router.push("/(main_navigation)/(account)/AccountSettings")}
          style={{
            backgroundColor: "white",
            width: "85%",
            paddingVertical: 20,
            borderRadius: 15,
            alignItems: "center",
            marginBottom: 15,
          }}
        >
          <Text style={{ fontSize: 20 }}>Account Settings</Text>
        </TouchableOpacity>





      










    </View>

  );
}