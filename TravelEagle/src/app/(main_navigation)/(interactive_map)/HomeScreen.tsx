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
      
    </View>

  );
}