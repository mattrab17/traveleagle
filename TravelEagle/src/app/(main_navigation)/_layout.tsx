import React from "react";
import { Tabs } from "expo-router";
import { StatusBar } from "react-native";
import { BACKGROUND_COLOR } from "../../app/constants/colors";

import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const ACTIVE_TAB_COLOR = "#FDD084";
const INACTIVE_TAB_COLOR = "#8F8F8F";

export default function RootLayout() {
  return (
    <>
      <StatusBar barStyle="light-content" />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: BACKGROUND_COLOR,
            borderTopWidth: 0,
            marginTop: -15
          },
          tabBarActiveTintColor: ACTIVE_TAB_COLOR,
          tabBarInactiveTintColor: INACTIVE_TAB_COLOR,
        }}
      >
        <Tabs.Screen
          name="(interactive_map)/HomeScreen"
          options={{
            title: "Explore",
            tabBarIcon: ({ color, size }) => (
              <Feather name="map" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="TripList"
          options={{
            title: "Itinerary",
            tabBarIcon: ({ color, size }) => (
              <Feather name="calendar" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="(community)/CommunityPage"
          options={{
            title: "Community",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="account-group-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />

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

        <Tabs.Screen
          name="(itinerary)/MyItineraries"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="(itinerary)/AiItineraryMaker"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="(itinerary)/ItineraryChoose"
          options={{ href: null }}
        />
      </Tabs>
    </>
  );
}
