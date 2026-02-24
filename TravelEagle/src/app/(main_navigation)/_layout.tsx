import React from "react";
import { Tabs } from "expo-router";
import { StatusBar } from "react-native";
import { BACKGROUND_COLOR } from "../../app/constants/colors";

// Icon Libraries
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const ACTIVE_TAB_COLOR = "#FDD084";
const INACTIVE_TAB_COLOR = "#8F8F8F";

export default function RootLayout() {
  return (
    <>
      <StatusBar barStyle="light-content" />

{/* NAVIGATION BAR START */}

      <Tabs //Tabs that are displayed on the navigation bar
        screenOptions={{
          headerShown: false,

          // Background
          tabBarStyle: {
            backgroundColor: BACKGROUND_COLOR,
            borderTopWidth: 0,
          },

          // Automatic active/inactive coloring
          tabBarActiveTintColor: ACTIVE_TAB_COLOR,
          tabBarInactiveTintColor: INACTIVE_TAB_COLOR,
        }}
      >
        {/* HomeScreen Tab */}
        <Tabs.Screen
          name="(interactive_map)/HomeScreen"
          options={{
            title: "Explore",
            tabBarIcon: ({ color, size }) => (
              <Feather name="map" size={size} color={color} />
            ),
          }}
        />

        {/* MyItineraries Tap */}

        <Tabs.Screen
          name="(itinerary)/MyItineraries"
          options={{
            title: "Itinerary",
            tabBarIcon: ({ color, size }) => (
              
              <Feather name="calendar" size={size} color={color} />
            ),
            
          }}
        
        
        
        
        />
        {/* AccountSettings Tab */}
        <Tabs.Screen
          name="(account)/AccountSettings"
          options={{
            title: "Account",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="account-circle-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />

      </Tabs>

{/* NAVIGATION BAR END */}
      
    </>
  );
}
