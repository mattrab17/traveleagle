import React, { useCallback, useEffect, useMemo, useRef } from "react";
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
  Linking,
  Alert, //A tap handler that allows Strings to be pressed and used as links
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
import { tripController } from "@/controllers/tripController";
import { itineraryController } from "@/controllers/itineraryController";
import DropDownPicker from 'react-native-dropdown-picker'; 
import { useAuth } from "../../(authentication)/Auth";
import { useFocusEffect } from "expo-router";

type SelectedPlaceType = { //describes the structure of a Place object
  name?: string; 
  lat?: number;
  lng?: number;
  description?: string;
  rating?: number; //stores the rating
  address?: string; //stores the address
  website?: string; //stores the website
  openHours?: string; //stores the openhours
  crowdLevel?: string; //stores the crowd levels
  photoUrl?: string; //stores the photo
  placeId?: string; //stores the placeid
  place_id?: number;
  formatted_address?: string;
  place_data?: any;
  geometry?: any;

} | null;

//Defines the UI labels for filters.
//Every UI label is mapped to GeoapifyAPI string in a dictionary data structure

const FILTER_CATEGORY_MAP: Record<string, string> = {
  Hotels: "accommodation.hotel", //hotels filter
  Gas: "service.vehicle.fuel", //gas filter
  Bars: "catering.bar", //bars filter
  Museums: "entertainment.museum", //museum filter
  Zoos: "entertainment.zoo", //zoos filter
  Parks: "leisure.park", //parks filter
  "Rental Cars": "rental.car", //rental cars filter
  Restaurants: "catering.restaurant", //restaurants filter
  Coffee: "catering.cafe", //coffee
};


export default function HomeScreen()
{
  const {user} = useAuth();
  
  const mapRef = useRef<any>(null);
  //mapRef -> references the Google maps map. Null means it doesn't load immediately

  //STATES:==========================
  
  /*CONTROLS THE BOTTOM SHEET FOR MARKERS/PINS*/
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlaceType>(null);
  //selectedPlace -> holds the current value of the selected item (address, marker, marker data)
  //setSelectedPlace -> function used to update the selectedPlace variable
  //useState is initialized with a value of null

  //CONTROLS THE DIRECTIONS FROM A USER TO A LOCATION
  const [showDirections, setShowDirections] = useState(false);

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
  const [selectedTrip, setSelectedTrip] = useState(null);

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

  //FILTER SELECTION LOGIC===================================

  //Notes:
  //When a user taps a filter, toggleFilter function updates the filter's state
  //toggleFilter takes a filterName parameter, which is a filter from the user's selection
 
  const toggleFilter = (filterName: string) => {
    
    if (selectedFilters.includes(filterName)) { //if the state "selectedFilters" contains a filter
      
      //Set the state of a filter:
      //1. Go into the selectedFilters array
      //2. Call the .filter method, which creates an array that adds items that pass a condition
      //3. '(item) =>' a function that iterates through every item in the selected filters array
      //4. if a selected index(item) is equal to the filterName, keep the item in setSelectedFilters, otherwise, remove it
      
      setSelectedFilters(selectedFilters.filter((item) => item !== filterName));
      


      //Adding additional filters to the list
      //1. '[]' creates a new empty array 
      //2. ...selectedFilters -> this is a spread operator, which tells the
      //                      code to take everything currently in the selectedFilters array and copy it into the new array
      //3. take filterName and add it to the end of the new array
    } else
    {
      setSelectedFilters([...selectedFilters, filterName]);
    }
  };

  
  /* 1. DYNAMIC IMAGE SELECTION -> decides which picture to show for a place. 
  
*/
const selectedPlaceImage = selectedPlace?.photoUrl 
    // IF we have a photo URL from Google...
    ? { uri: selectedPlace.photoUrl } 
    // otherwise...  use our local 'house.png' as a placeholder.
    : require("../../../../assets/images/house.png"); //in the assets/image folder


/* 2. RATING FORMATTER - ensures the star rating are always rounded to the tenth place
*/
const selectedPlaceRating = typeof selectedPlace?.rating === "number"
    // If the rating is a valid number, add a Star Emoji and round it to 10th place
    // 
    ? `${"\u2B50"} ${selectedPlace.rating.toFixed(1)}`
    // if no rating exists, show n
    : `${"\u2B50"} N/A`;


/* 3. WEBSITE LINK HANDLER - opens a location's website in the phone's default browser
*/
const openWebsite = async (website?: string) => {
  if (!website || website === "Not available") return; //if a website is not available, return nothing

  const trimmedWebsite = website.trim();
  const websiteWithProtocol = /^https?:\/\//i.test(trimmedWebsite) //prepend the website with https:// if it is missing
    ? trimmedWebsite
    : `https://${trimmedWebsite}`;

  const canOpen = await Linking.canOpenURL(websiteWithProtocol);
  if (canOpen) {
    await Linking.openURL(websiteWithProtocol);
  }
};

const openHoursLines = useMemo(() => {
  const raw = selectedPlace?.openHours;
  if (!raw || raw === "Not available") return [];

  // Supports either newline-delimited or comma-delimited "Day: hours" strings.
  const normalized = String(raw).replace(/\r/g, "");
  const byNewline = normalized.split("\n").map((line) => line.trim()).filter(Boolean);
  if (byNewline.length > 1) return byNewline;

  return normalized
    .split(/,(?=\s*[A-Za-z]+:)/)
    .map((line) => line.trim())
    .filter(Boolean);
}, [selectedPlace?.openHours]);



    //Updates the place when a user clicks on it
  const handleSetSelectedPlace = (place: SelectedPlaceType) =>
  {
  
    // Save the new place data into our state variable.
    setSelectedPlace(place);

    // Reset the directions—if we were looking at directions for the OLD place, 
    // we want them to disappear now that we have a NEW place.
    setShowDirections(false);
};


  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]); 
  const [trips, setTrips] = useState<any[]>([]);

/*   useEffect(() => {
    loadTrips();}, []); */

     useFocusEffect(useCallback(() => {
      if(user?.id){
      loadTrips();}}, [user]));

      async function loadTrips(){
      const {data} = await tripController.loadAllTrips(user.id);
      setTrips(tripController.getUpcomingTrips(data));
    }

   /*  const  userID = 'bde439b9-f312-45af-81b2-f07e1ee74648';
    async function loadTrips(){
      const {data} = await tripController.loadAllTrips(userID);
      setTrips(data);

    } */

 async function handleAddPlace(){
         /*  console.log('selectedTrip:', selectedTrip);
          console.log('selectedPlace:', selectedPlace);
          console.log('place_data:', selectedPlace?.place_data);
          console.log('placeId:', selectedPlace?.placeId);
          console.log('time:', time); */
        const {data, error} = await itineraryController.addPlaceFromGoogleMaps(
            Number(selectedTrip),
            selectedPlace,
            time,
        );
        
      
        if (error){
            Alert.alert('Error', 'Failed to add to itinerary');
            return;
        }
        setIsAddTripVisible(false);
        setSelectedTrip(null);
        setSelectedPlace(null);
        setTime(new Date());
        //Redirect to itinerary?? || Stay in MapView
    }





  
  
  
  //Function that translates filter labels to API keys that Geoapify recognizes
  const activeFilterCategories = selectedFilters //put user's selected filters into the "activeFilters" variable
  
    // .map -> a function that takes filter as a parameter
    //      What it does: it goes through selectedFilters one by one, and for each filter, looks it's name up in a dictionary called "FILTER_CATEGORY_MAP"
    //      Simply put, it matches a name to a value
    .map((filterName) => FILTER_CATEGORY_MAP[filterName])


    //.filter is a shortcut for "Keep only real filters in the dictionary and don't keep null or undefined values"
    .filter(Boolean);   

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
                setSelectedPlace={handleSetSelectedPlace}
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
          {/* ===============Google Maps Component =====================*/}

          
          <GoogleMapsView
            mapRef={mapRef} // Passing the mapRef as an argument to GoogleMapsView
            showDirections={showDirections}
            activeFilterCategories={activeFilterCategories}
            selectedPlace={selectedPlace}
            setSelectedPlace={handleSetSelectedPlace}
            //When marker is pressed, retrieve placeData, then set placeData to the selected place
            onMarkerPress={(placeData: SelectedPlaceType) => handleSetSelectedPlace(placeData)}
          />

          {/* Travel Eagle Bottom Sheet Marker Card / Pop up =========================================================================*/}
          {selectedPlace && (
            <View style={styles.popUpCard}>
              {/* Card Info */}
              <View style={styles.cardHeader}>
                {/* SET THE PLACE NAME HERE */}
                <Text style={styles.cardTitle}>{selectedPlace?.name || "Selected Place"}</Text>  

                {/* SET THE PLACE RATING HERE  */} 
                <Text style={styles.ratingText}>{selectedPlaceRating}</Text> 
              </View>

              {/* Card Image */}
              {/* SET THE PLACE IMAGE HERE */}
              <Image 
                source={selectedPlaceImage}
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
                    if (selectedPlace) {
                      setShowDirections(true);
                    }
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
              source={selectedPlaceImage}
              style={styles.moreInfoImage}
            />

            <Text style={styles.moreInfoPlaceName}>
              {selectedPlace?.name || "Place Name"}
            </Text>
              {/* LOCATION TIME */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Open Hours:</Text> 
              {openHoursLines.length > 0 ? (
                <View style={styles.openHoursList}>
                  {openHoursLines.map((line, index) => (
                    <Text key={`${line}-${index}`} style={styles.openHoursLine}>
                      {line}
                    </Text>
                  ))}
                </View>
              ) : (
                <Text style={styles.infoValue}>Not available</Text>
              )}
            </View>

            {/* CROWD LEVEL */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Crowd Level:</Text>
              <Text style={styles.infoValue}>{selectedPlace?.crowdLevel || "Not available"}</Text>
            </View>
              {/* ADDRESS */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue}>{selectedPlace?.address || "Not available"}</Text>
            </View>
              {/* WEBSITE */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Website:</Text>
              {selectedPlace?.website && selectedPlace.website !== "Not available" ? (
                <TouchableOpacity onPress={() => openWebsite(selectedPlace.website)}>
                  <Text style={[styles.infoValue, styles.websiteLink]}>{selectedPlace.website}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.infoValue}>Not available</Text>
              )}
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
              {/* Add check for if trips are empty. If trips are empty, 
              don't show picker and show button to redirect to tripsList.tsx */}
             <DropDownPicker
                    open={open}
                    value={selectedTrip}
                    items={(trips || []).map(({destination, trip_id}) => ({label: destination, value: trip_id}))}
                    setOpen={setOpen}
                    setValue={setSelectedTrip}
                    placeholder={'Select a trip'}
                    listMode="SCROLLVIEW"
                    style={styles.tripPicker}
                    dropDownContainerStyle={styles.tripPickerDropdown}
                    textStyle={styles.tripPickerText}
                    placeholderStyle={styles.tripPickerPlaceholder}
                />



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
                onPress={handleAddPlace}
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

//STYLES============================================================================
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
    overflow: "visible",
    zIndex: 20,
    elevation: 20,
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
    overflow: "visible",
    zIndex: 30,
    elevation: 30,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c3252",
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 50,
    overflow: "visible",
    zIndex: 40,
    elevation: 40,
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
    borderTopWidth: 0.17,
    zIndex: 1,
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
    lineHeight: 20,
  },
  openHoursList: {
    marginTop: 2,
  },
  openHoursLine: {
    color: 'white',
    fontSize: 13,
    lineHeight: 18,
  },
  websiteLink: {
    color: '#7FB8FF',
    textDecorationLine: 'underline',
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
    color: '#ffffff20',
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
  tripPicker: {
    backgroundColor: '#0A1A31',
    borderColor: '#0A1A31',
    borderRadius: 8,
    marginBottom: 20,
    minHeight: 48,
  },
  tripPickerDropdown: {
    backgroundColor: '#0A1A31',
    borderColor: '#0A1A31',
  },
  tripPickerText: {
    color: 'white',
    fontSize: 16,
  },
  tripPickerPlaceholder: {
    color: 'white',
    fontSize: 16,
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



