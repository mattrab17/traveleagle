import React from "react";
import { useState } from "react"; //a hook that helps declare the state of a variable on a screen
import { View,
  TextInput, //Input box component
  StyleSheet, //Style component to style objects
  Image, //Image component to render Travel Eagle image
  Text, //Text component like <p>
  TouchableOpacity, //creates an interactive box
  StatusBar, //Component that controls the device's status settings like Wifi, Battery, and time
  Modal, //Component that helps display content as an overlay or on top of the current screen
  Platform, //Provides platform-specific logic
} from "react-native";
import { Feather } from "@expo/vector-icons"; //Vector icon family import
import MaterialIcons from '@expo/vector-icons/MaterialIcons'; //Vector icon family import
import { SafeAreaView } from "react-native-safe-area-context"; //Provides a safe area so objects fall within a device's screen dimensions
import {
  BACKGROUND_COLOR,
} from "../../constants/colors";
import GoogleMapsView from "../../(google_maps_info)/GoogleMapsView";

//IMPORT FOR DATA AND TIME PICKING FROM EXPO 
import DateTimePicker from '@react-native-community/datetimepicker'; // Add this import

export default function HomeScreen()
{
  //STATES:==========================
  
  
  /*CONTROLS THE BOTTOM SHEET FOR MARKERS/PINS*/
  const [selectedPlace, setSelectedPlace] = useState(null);
  //selectedPlace -> holds the current value of the selected item (address, marker, marker data)
  //setSelectedPlace -> function used to update the selectedPlace variable
  //useState is initialized with a value of null
  

  //CONTROLS THE POPUP AFTER PRESSING ADD TRIP
  const [isAddTripVisible, setIsAddTripVisible] = useState(false);

  //CONTROLS THE TIME PICKER AFTER PRESSING ADD TRIP
  const [showTimePicker, setShowTimePicker] = useState(false);

  // State to store the actual Date/Time object
  const [time, setTime] = useState(new Date()); 

  // State to store the selected trip name from the dropdown in "Add Trip"
  const [selectedTrip, setSelectedTrip] = useState("Example Trip");

  // Helper function to format the Date object into a readable "12:00 AM" string
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  // Function called when the user scrolls the time wheel
  const onTimeChange = (event, selectedDate) => {
    // For Android, we hide the picker after they press "OK"
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (selectedDate) { //sets the date
      setTime(selectedDate);
    }
  };

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

          


          
          {/* Travel Eagle Bottom Sheet Marker Card / Pop up =========================================================================*/}
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
                  onPress={() =>
                  {
                    setIsAddTripVisible(true) //opens the Add to Itinerary Modal
                    setSelectedPlace(null) //hides the "Marker" popup

                  }} 
                >
                  <Text style={styles.btnText}>Add to Trip</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
      {/* Travel Eagle Bottom Sheet Marker Card / Pop up end ========================================================================= */}

      {/* Add Trip Button Modal =============================================================================================*/}

      <Modal
        animationType="fade" //the popup fades in 
        transparent = {true} //overlays the popup over the map
        visible={isAddTripVisible} //activates the Add Trip Popup
        onRequestClose={() => setIsAddTripVisible(false)} //Handles hardware back button
>
  {/* Popup Overlay */}
        <View style={styles.modalOverlay}> 
          {/* Inside Popup */}
    <View style={styles.itineraryContainer}>
      
      {/* Header */}
      <View style={styles.itineraryHeader}>
        <Feather name="plus" size={20} color="white" />
        <Text style={styles.itineraryTitle}>Add to Itinerary</Text>
      </View>

            {/* Divides the Header and main content in the popup */}
      <View style={styles.divider} />

      {/* Itinerary Inputs */}
      <Text style={styles.inputLabel}>Select Itinerary:</Text> 
            {/* Itinerary Inputs */}
            <TouchableOpacity 
              style={styles.itineraryInput}
              onPress={() => {
                // Toggles between two names to show selection logic
                setSelectedTrip(selectedTrip === "Example Trip" ? "California Trip" : "Example Trip");
              }}
            > 
            {/* EXAMPLE ITINERARY PLACEHOLDER */}
        <Text style={styles.inputText}>{selectedTrip}</Text> 
        <Feather name="chevron-down" size={20} color="white" />
      </TouchableOpacity>

      {/* Select Time Input */}
      <Text style={styles.inputLabel}>Select Time:</Text> 
            <TouchableOpacity 
              style={styles.itineraryInput}
              onPress={() => setShowTimePicker(true)}
            >
              {/* Example time */}
        <Text style={styles.inputText}>{formatTime(time)}</Text>
        <Feather name="clock" size={20} color="white" />
      </TouchableOpacity>

      {/* Time Scroller Component */}
      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
          textColor="white" // Only for iOS so that the display doesn't look strange
        />
      )}

            {/* Buttons Row */}
            <View style={styles.itineraryButtonRow}>
            {/* cancel button */}
        <TouchableOpacity 
          style={styles.cancelBtn}
          onPress={() => setIsAddTripVisible(false)}
        >
          
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

              {/* Add button */}
        <TouchableOpacity 
          style={styles.addItineraryBtn}
          onPress={() => setIsAddTripVisible(false)}
        >
           <Feather name="check" size={18} color="white" style={{marginRight: 8}} />
           <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

    </View>
  </View>
      </Modal>

      {/* Add Trip Button Modal end =============================================================================================*/}
      
    </SafeAreaView>
  );
}

//STYLES
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
  contentArea: {
    flex: 1,
    backgroundColor: "#0A1628", 
    borderColor: "#ffffff75",
    borderTopWidth: 0.17
  },
  popUpCard: {
    position: 'absolute', 
    bottom: 20,           
    left: 15,
    right: 15,
    backgroundColor: '#0A1931', 
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ffffff30',
    zIndex: 100,          
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
    backgroundColor: '#FFB347', 
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  dirBtn: {
    backgroundColor: '#3858D6', 
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

  //MODAL STYLES ================================
  modalOverlay: { //main overlay
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itineraryContainer: { //main popup
    width: '90%',
    backgroundColor: '#051124', 
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ffffff15',
  },
  itineraryHeader: { //Top header of popup
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  itineraryTitle: { //Add to Itinerary Title
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 10,
  },
  divider: { //Gray line that divides header and main content
    height: 1,
    backgroundColor: '#ffffff20',
    marginBottom: 20,
  },
  inputLabel: { //input subheadings: "Select Itinerary:" & "Select Time"
    color: '#D1D1D1',
    fontSize: 14,
    marginBottom: 8,
  },
  itineraryInput: { //input box styling
    backgroundColor: '#0A1A31', 
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  inputText: { //inside input boxes: "Example Trip" & "12:00 AM"
    color: 'white',
    fontSize: 16,
  },
  itineraryButtonRow: { //Buttons: "Cancel" and "Add"
    flexDirection: 'row', 
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  cancelBtn: { //Cancel Button Styling
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
    backgroundColor: '#1c3252',
    borderRadius: 6,
  },
  cancelBtnText: { //Cancel Button Text Styling
    color: 'white',
    fontWeight: '500',
  },
  addItineraryBtn: { //Add Button Styling
    flexDirection: 'row',
    backgroundColor: '#3858D6', 
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
  },
  addBtnText: { //Add Button Text Styling
    color: 'white',
    fontWeight: 'bold',
  },
});