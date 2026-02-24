import React from "react";
import { useState } from "react"; //a hook that helps declare the state of a variable on a screen
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

export default function HomeScreen()
{
  /* CONTROLS THE STATE OF THE LOCATION POPUP */
  const [selectedPlace, setSelectedPlace] = useState(null)
  //selectedPlace -> holds the current value of the selected item (address, marker, marker data)
  //setSelectedPlace -> function used to update the selectedPlace variable
  //useState is initialized with a value of null
  
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
          {/* Google Maps Component */}
          <GoogleMapsView
            //When marker is pressed, retrieve placeData, then set placeData to the selected place
            onMarkerPress={(placeData) => setSelectedPlace(placeData)}
            //onMarkerPress -> an event listener for when a user taps on a map marker
            //placeData -> an argument that's passed. It's an object that contains marker information
            //setSelectedPlace -> a state setter function from the useState hook
            //                -updates the application's state status with the data of the currently pressed marker

            
          />

          


          
          {/* Travel Eagle Bottom Sheet Marker Card / Pop up */}
          {selectedPlace && ( //IF SELECTEDPLACE IS TRUE OR HAS A PLACE, THEN RENDER THE CARD, OTHERWISE, DON'T RENDER ANYTHING
            
            <View style={styles.popUpCard}>
              {/* Card Info */}
              <View style={styles.cardHeader}>

                {/* SET THE PLACE NAME HERE */}
                <Text style={styles.cardTitle}>{selectedPlace.name}</Text>  

                {/* SET THE PLACE RATING HERE  */} 
                <Text style={styles.ratingText}>⭐ 4.6</Text> 
               
              </View>

              
              {/* Card Image */}
              {/* SET THE PLACE IMAGE HERE */}
              <Image 
                source={require("../../../../assets/images/traveleaglelogo.png")} //FOR NOW, THE IMAGE OF THE PLACE IS THE TRAVEL EAGLE LOGO
                style={styles.cardImage} 
              />

              {/* Interactive Button Row */}
              <View style={styles.buttonRow}>
                {/* MORE INFO BUTTON */}
                <TouchableOpacity
                  style={styles.infoBtn}
                  onPress={() => setSelectedPlace(null)} // Closes the card by setting state to null -> CHANGE THIS TO DO A SPECIFIC ACTION
                >
                  <Text style={styles.btnText}>More Info</Text>
                </TouchableOpacity>
                
                {/* DIRECTIONS BUTTON */}
                <TouchableOpacity
                  style={styles.dirBtn}
                  onPress={() => setSelectedPlace(null)} // Closes the card by setting state to null -> CHANGE THIS TO DO A SPECIFIC ACTION
                >
                  <Text style={styles.btnText}>Directions</Text>
                  
                </TouchableOpacity>
                
                {/* ADD TRIP BUTTON */}
                <TouchableOpacity 
                  style={styles.addBtn}
                  onPress={() => setSelectedPlace(null)} // Closes the card by setting state to null -> CHANGE THIS TO DO A SPECIFIC ACTION
                >
                  <Text style={styles.btnText}>Add Trip</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
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

  // NEW STYLES FOR THE MARKER CARD
  popUpCard: {
    position: 'absolute', // Allows the card to float on top of the map
    bottom: 20,           // Pushes the card up from the bottom edge
    left: 15,
    right: 15,
    backgroundColor: '#0A1931', 
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ffffff30',
    zIndex: 100,          // Ensures it stays in front of the Map layer
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  ratingText: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  cardImage: {
    width: '100%',
    height: 140,
    borderRadius: 15,
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoBtn: {
    backgroundColor: '#FFB347', // Orange color
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  dirBtn: {
    backgroundColor: '#3858D6', // Blue color
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  addBtn: {
    backgroundColor: '#1C3252',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});