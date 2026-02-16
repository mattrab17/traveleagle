import React from "react";
import { View,
  TextInput, //Input box component
  StyleSheet, //Style component to style objects
  Image, //Image component to render Travel Eagle image
  Text, //Text component like <p>
  TouchableOpacity, //creates an interactive box
  StatusBar, //Component that controls the device's status settings like Wifi, Battery, and time
} from "react-native";
import { Feather } from "@expo/vector-icons"; //Vector icon family import
import MaterialIcons from '@expo/vector-icons/MaterialIcons'; //Vector icon family import
import { SafeAreaView } from "react-native-safe-area-context"; //Provides a safe area so objects fall within a device's screen dimensions
import {
  BACKGROUND_COLOR,
} from "../../constants/colors";
import GoogleMapsView from "../../(google_maps_info)/GoogleMapsView";

export default function HomeScreen() {
  return (
    
    <SafeAreaView style={styles.safe} edges={["top"]}>
                                        {/* edges property places padding at the top edge of the screen */}
      <StatusBar barStyle="light-content" /> 
      {/* Device status settings are set to light mode color */}
      

      <View style={styles.container}>
        {/* Hero Section */}
        <View style={styles.topBox}>
          {/* Explore Box */}
          <View style={styles.header}>
            <Image
              source={require("../../../../assets/images/traveleaglelogo.png")}
              style={styles.logo}
            />
            <Text style={styles.headerTitle}>Explore</Text>
          </View>

          {/* Search + Filter */}
          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <Feather name="search" size={18} color="#8F8F8F" />
              <TextInput
                placeholder="Search..."
                placeholderTextColor="#8F8F8F"
                style={styles.input}
              />
            </View>

            <TouchableOpacity style={styles.filterBtn}>
            <MaterialIcons name="filter-list" size={24} color="#8F8F8F" />
            </TouchableOpacity>
          </View>
        </View>

        {/* MIDDLE CONTENT AREA FOR MAP */}
        <View style={styles.contentArea}>
          <GoogleMapsView />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#000C33", // MAIN BACKGROUND COLOR
  },
  container: {
    flex: 1,
  },

  
  topBox: {
    backgroundColor: BACKGROUND_COLOR,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 15,
    
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  logo: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c3252",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    marginLeft: 8,
    fontSize: 15,
  },
  filterBtn: {
    marginLeft: 10,
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#1c3252",
    justifyContent: "center",
    alignItems: "center",
  },

  // MIDDLE CONTENT AREA
  contentArea: {
    flex: 1,
    backgroundColor: "#0A1628", 
    borderColor: "#ffffff75",
    borderTopWidth: .17
  },
});
