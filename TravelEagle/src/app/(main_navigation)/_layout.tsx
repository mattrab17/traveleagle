import { Tabs } from "expo-router";
import { StatusBar, View } from "react-native";
import React from "react"
import { BACKGROUND_COLOR, THIRD_BACKGROUND_COLOR } from "../../app/constants/colors";

//Icons for navigation bar
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function RootLayout() {
  return (
    <React.Fragment>
      <StatusBar/>
      <Tabs>
        <Tabs.Screen name="(interactive_map)/HomeScreen"
          options={{
            title: "Explore",
            headerShown: false,
            tabBarIcon: () =>
            {
              return <Feather name="map" size={24} color="black" />;
            }

          }} />
        
        <Tabs.Screen name="(account)/AccountSettings"
          options={{
            title: "Account",
            headerShown: false,
            tabBarIcon: () =>
            {
              return <MaterialCommunityIcons name="account-circle-outline" size={24} color="black" />
            }
            
        }}
        />
        
      </Tabs> 
    </React.Fragment>
  );
}
