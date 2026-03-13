import React, { useRef } from "react";
import { useState } from "react"; //a hook that helps declare the state of a variable on a screen
import { View,
  StyleSheet, //Style component to style objects
  Image, //Image component to render Travel Eagle image
  Text, //Text component like <p>
  TouchableOpacity, //creates an interactive box
  StatusBar, //Component that controls the device's status settings like Wifi, Battery, and time
  Modal, //Component that helps display content as an overlay or on top of the current screen
  Platform, //Provides platform-specific logic
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons"; //Vector icon family import
import MaterialIcons from '@expo/vector-icons/MaterialIcons'; //Vector icon family import
import { SafeAreaView } from "react-native-safe-area-context"; //Provides a safe area so objects fall within a device's screen dimensions
import {
  BACKGROUND_COLOR,
} from "../../constants/colors";
import GoogleMapsView from "../../(google_maps_info)/GoogleMapsView";

//IMPORT FOR DATA AND TIME PICKING FROM EXPO 
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'; // Import for Data and Time picking
import GooglePlacesInput from "../../(google_maps_info)/GooglePlacesAutocomplete"; //Import to connect Travel Eagle Search bar with Google Maps Search

type SelectedPlaceType = { //describes the structure of a Place object
  name?: string; 
  lat?: number;
  lng?: number;
  description?: string;
} | null;


export default function HomeScreen()
{
  const mapRef = useRef<any>(null);
  //mapRef -> references the Google maps map. Null means it doesn't load immediately

  //STATES:==========================
  
  /*CONTROLS THE BOTTOM SHEET FOR MARKERS/PINS*/
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlaceType>(null);
  //selectedPlace -> holds the current value of the selected item (address, marker, marker data)
  //setSelectedPlace -> function used to update the selectedPlace variable
  //useState is initialized with a value of null

  //CONTROLS THE POPUP AFTER PRESSING ADD TRIP
  const [isAddTripVisible, setIsAddTripVisible] = useState(false);

  //CONTROLS THE TIME PICKER AFTER PRESSING ADD TRIP
  const [showTimePicker, setShowTimePicker] = useState(false);

  //CONTROLS THE FILTER MODAL
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  //CONTROLS THE MORE INFO MODAL
  const [isMoreInfoVisible, setIsMoreInfoVisible] = useState(false);

  // State to store the actual Date/Time object
  const [time, setTime] = useState(new Date()); 

  // State to store the selected trip name from the dropdown in "Add Trip"
  const [selectedTrip, setSelectedTrip] = useState("Example Trip");

  // State to store selected filters
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // defines filterOptions
    // defines filterOptions
 const filterOptions = [
  "Hotels",
  "Gas",
  "Bars",
  "Museums",
  "Zoos",
  "Parks",
  "Rental Cars",
  "Restaurants",
  "Coffee",
];

  // Helper function to format the Date object into a readable "12:00 AM" string
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  // Function called when the user scrolls the time wheel
  const onTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS !== "ios") {
      setShowTimePicker(false);
    }

    if (selectedDate) { //sets the date
      setTime(selectedDate);
    }
  };

  // Simple function to add or remove a filter
  const toggleFilter = (filterName: string) => {
    if (selectedFilters.includes(filterName)) {
      setSelectedFilters(selectedFilters.filter((item) => item !== filterName));
    } else {
      setSelectedFilters([...selectedFilters, filterName]);
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
              <Feather name="search" size={18} color="#8F8F8F" style={styles.searchIcon} />
              <GooglePlacesInput
                mapRef={mapRef}
                setSelectedPlace={setSelectedPlace}
              />
            </View>

            <TouchableOpacity
              style={styles.filterBtn}
              onPress={() => setIsFilterVisible(true)}
            >
              <MaterialIcons name="filter-list" size={24} color="#8F8F8F" />
            </TouchableOpacity>
          </View>

          {/* Selected Filters Preview */}
          {selectedFilters.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterPreviewRow}
            >
              {selectedFilters.map((filter, index) => (
                <View key={index} style={styles.filterChip}>
                  <Text style={styles.filterChipText}>{filter}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* MIDDLE CONTENT AREA FOR MAP */}
        <View style={styles.contentArea}>
          {/* Google Maps Component */}
          <GoogleMapsView
            mapRef={mapRef} // Passing the mapRef as an argument to GoogleMapsView
            selectedPlace={selectedPlace}
            setSelectedPlace={setSelectedPlace}
            //When marker is pressed, retrieve placeData, then set placeData to the selected place
            onMarkerPress={(placeData: SelectedPlaceType) => setSelectedPlace(placeData)}
          />

          {/* Travel Eagle Bottom Sheet Marker Card / Pop up =========================================================================*/}
          {selectedPlace && (
            <View style={styles.popUpCard}>
              {/* Card Info */}
              <View style={styles.cardHeader}>
                {/* SET THE PLACE NAME HERE */}
                <Text style={styles.cardTitle}>{selectedPlace?.name || "Selected Place"}</Text>  

                {/* SET THE PLACE RATING HERE  */} 
                <Text style={styles.ratingText}>⭐ 4.6</Text> 
              </View>

              {/* Card Image */}
              {/* SET THE PLACE IMAGE HERE */}
              <Image 
                source={require("../../../../assets/images/traveleaglelogo.png")}
                style={styles.cardImage} 
              />

              {/* Interactive Button Row */}
              <View style={styles.buttonRow}>
                {/* MORE INFO BUTTON */}
                <TouchableOpacity
                  style={styles.infoBtn}
                  onPress={() => {
                    if (selectedPlace) {
                      setIsMoreInfoVisible(true);
                    }
                  }}
                >
                  <Text style={styles.btnText}>More Info</Text>
                </TouchableOpacity>
                
                {/* DIRECTIONS BUTTON */}
                <TouchableOpacity
                  style={styles.dirBtn}
                  onPress={() => {
                    // For now, just keep it simple.
                    // Since the map already draws directions when a place is selected,
                    // we are only keeping the card open.
                  }}
                >
                  <Text style={styles.btnText}>Directions</Text>
                </TouchableOpacity>
                
                {/* ADD TRIP BUTTON */}
                <TouchableOpacity 
                  style={styles.addBtn}
                  onPress={() =>
                  {
                    setIsAddTripVisible(true); //opens the Add to Itinerary Modal
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

      {/* FILTER MODAL =============================================================================================*/}
      <Modal
        animationType="fade" //Fade in when pressed
        transparent={true} //keep it transparent
        visible={isFilterVisible} //stores whether the filter is visible or not
        onRequestClose={() => setIsFilterVisible(false)} //when closed, render the screen without the filter modal
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModalContainer}>
            <View style={styles.modalTopRow}>
              <Text style={styles.filterModalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                <Feather name="x" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.filtersWrap}>
              {filterOptions.map((filter, index) => {
                const isSelected = selectedFilters.includes(filter);

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.filterOptionBtn,
                      isSelected && styles.filterOptionBtnSelected, //activates style for filter option
                    ]}
                    onPress={() => toggleFilter(filter)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        isSelected && styles.filterOptionTextSelected, //activate style when a filter option is pressed
                      ]}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.filterButtonsRow}>
              <TouchableOpacity
                style={styles.clearFilterBtn}
                onPress={() => setSelectedFilters([])}
              >
                <Text style={styles.clearFilterBtnText}>Clear</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyFilterBtn}
                onPress={() => setIsFilterVisible(false)}
              >
                <Text style={styles.applyFilterBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* FILTER MODAL END =============================================================================================*/}

      {/* MORE INFO MODAL =============================================================================================*/}
      <Modal
        animationType="fade" //fade in animation
        transparent={true}
        visible={isMoreInfoVisible} //sets the state of the MoreInfo modal
        onRequestClose={() => setIsMoreInfoVisible(false)} //when closed, render the screen without the MoreInfo screen 
      >
        <View style={styles.modalOverlay}>
          <View style={styles.moreInfoContainer}>
            <View style={styles.modalTopRow}>
              <Text style={styles.moreInfoTitle}>More Info</Text>
              <TouchableOpacity onPress={() => setIsMoreInfoVisible(false)}>
                <Feather name="x" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <Image
              source={require("../../../../assets/images/traveleaglelogo.png")}
              style={styles.moreInfoImage}
            />

            <Text style={styles.moreInfoPlaceName}>
              {selectedPlace?.name || "Place Name"}
            </Text>
              {/* LOCATION TIME */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Open Hours:</Text> 
              <Text style={styles.infoValue}>9:00 AM - 10:00 PM</Text>
            </View>

            {/* CROWD LEVEL */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Crowd Level:</Text>
              <Text style={styles.infoValue}>Moderate</Text>
            </View>
              {/* ADDRESS */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue}>123 Example Street, New York, NY</Text>
            </View>
              {/* WEBSITE */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Website:</Text>
              <Text style={styles.infoValue}>www.exampleplace.com</Text>
            </View>

            <TouchableOpacity
              style={styles.closeMoreInfoBtn}
              onPress={() => setIsMoreInfoVisible(false)}
            >
              <Text style={styles.closeMoreInfoBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* MORE INFO MODAL END =============================================================================================*/}

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
                textColor="white"
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
    zIndex: 20,
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
    zIndex: 30,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c3252",
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 50,
    zIndex: 40,
  },
  searchIcon: {
    marginRight: 8,
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
  filterPreviewRow: {
    marginTop: 10,
  },
  filterChip: {
    backgroundColor: "#3858D6",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
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
    flex: 1,
    marginRight: 10,
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
    paddingHorizontal: 16,
  },

  filterModalContainer: {
    width: '95%',
    backgroundColor: '#051124',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ffffff15',
  },
  modalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterModalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  filtersWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  filterOptionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#1c3252',
    marginRight: 10,
    marginBottom: 10,
  },
  filterOptionBtnSelected: {
    backgroundColor: '#3858D6',
  },
  filterOptionText: {
    color: 'white',
    fontSize: 14,
  },
  filterOptionTextSelected: {
    fontWeight: '700',
  },
  filterButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  clearFilterBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#1c3252',
    borderRadius: 8,
    marginRight: 10,
  },
  clearFilterBtnText: {
    color: 'white',
    fontWeight: '600',
  },
  applyFilterBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#3858D6',
    borderRadius: 8,
  },
  applyFilterBtnText: {
    color: 'white',
    fontWeight: '700',
  },

  moreInfoContainer: {
    width: '95%',
    backgroundColor: '#051124',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ffffff15',
  },
  moreInfoTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  moreInfoImage: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    marginBottom: 16,
  },
  moreInfoPlaceName: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    color: '#9DB3D1',
    fontSize: 13,
    marginBottom: 4,
  },
  infoValue: {
    color: 'white',
    fontSize: 15,
  },
  closeMoreInfoBtn: {
    marginTop: 15,
    backgroundColor: '#3858D6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeMoreInfoBtnText: {
    color: 'white',
    fontWeight: '700',
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
    marginTop: 10,
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
