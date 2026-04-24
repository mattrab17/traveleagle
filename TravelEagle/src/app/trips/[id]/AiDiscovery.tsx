import {
  Text,
  Image,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Platform,
  Modal,
  Alert,
} from "react-native";

import { Feather, Ionicons } from "@expo/vector-icons";

import {
  BACKGROUND_COLOR,
  WHITE_TEXT_COLOR,
  ORANGE_COLOR,
  SECONDARY_BACKGROUND_COLOR,
  SEARCH_BACKGROUND_COLOR,
} from "../../constants/colors";

import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import DropDownPicker from "react-native-dropdown-picker";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import React from "react";
import { itineraryController } from "../../../../controllers/itineraryController";
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from "@gorhom/bottom-sheet";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'; // Import for Data and Time picking
import { Picker } from "@react-native-picker/picker";
import { tripController } from "@/controllers/tripController";

export default function AIDiscoveryScreen()
{
    const { id, destination, lat, lng } = useLocalSearchParams();
    const mapRef = useRef<MapView>(null);
    const [value, setValue] = useState([]);
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([
        { label: "Exciting", value: "exciting" },
        { label: "Relaxing", value: "relaxing" },
        { label: "Nature", value: "nature" },
        { label: "Romatic", value: "romantic" },
        { label: "Food", value: "food" },
        { label: "Culture", value: "culture" },
    ]);
    const [inputText, setInputText] = useState("");
    const [messages, setMessages] = useState<any[]>([]);
    const router = useRouter();
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<any>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(true);
    const sampleMessages = [
                            'Best Coffee Shops',
                            'Hidden Gem Restaurants',
                            'Must-see landmarks',
                            'Parks and outdoor activites',
                        ];

    
    const handleSheetChange = useCallback((index:number) => {
        setIsSheetOpen(index >= 2);
    }, []);
    //CONTROLS THE POPUP AFTER PRESSING ADD TRIP
    const [isAddTripVisible, setIsAddTripVisible] = useState(false);
    
    //CONTROLS THE TIME PICKER AFTER PRESSING ADD TRIP
    const [showTimePicker, setShowTimePicker] = useState(false);
    // State to store the actual Date/Time object
    const [time, setTime] = useState(new Date()); 
    const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  };
   const onTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS !== "ios") {
        setShowTimePicker(false);
      }
  
      if (selectedDate) { //sets the date
        setTime(selectedDate);
      }
    };
  const [trip, setTrip] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1);

      

    async function handleSend(){
        const trimmed = inputText.trim();
                    if (trimmed.length === 0) {
                       return;
                } 
                    setMessages(msgs => [...msgs, {role: "user", text: trimmed}]);
                    setMessages(msgs => [...msgs, { role: "ai", text: "Finding suggestions..." }]);
                    setInputText("");
                    setSelectedPlace(null);

                    const {data, error} = await itineraryController.smartDiscovery(
                        trimmed,
                        String(destination)
                    );

                    if (error || !data){
                        setMessages(msgs => [...msgs, {role: "ai", text: "Sorry, I could't generate suggestions for your request."}] )
                    }
                    else{
                    const responseText = data.map((place, i) => `${i+1}. ${place.place_name} \n ${place.notes}`).join("\n\n")
                    setMessages(msgs => [...msgs, {role: "ai", text: responseText}]);
                    setSuggestions(data);
                    
                    const coords = data.map(s => ({latitude : s.lat, longitude: s.lng}));
                    if (coords.length > 0){
                        mapRef.current?.fitToCoordinates(coords, {
                            edgePadding: {top: 50, bottom: 50, right: 50, left: 50},
                            animated: true
                        })
                    }

                    }

    }

    async function handleAdd(){
        if(!selectedPlace) return;
        
        const {error} = await itineraryController.addDiscoveryPlace(
            Number(id),
            selectedPlace,
            selectedDay,
            time,
        );
         if (error){
                    Alert.alert('Error', 'Failed to add to itinerary');
                    return;
                }
        setIsAddTripVisible(false);
        setSelectedPlace(null);
        setTime(new Date());
        setSelectedDay(1);
        bottomSheetRef.current?.snapToIndex(1);
    }

    useEffect(() => {
        async function loadTrip() {
            const { data } = await tripController.loadTrip(Number(id));
            setTrip(data);
          }
          loadTrip();
    }, [id]);

    const totalDays = tripController.getTotalDays(trip);

   return(
    <SafeAreaView style={{ flex: 1, backgroundColor: BACKGROUND_COLOR }}>
        
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#7691bc' }}>
            <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}
                onPress={() => router.back()}
            >
                <Ionicons name="arrow-back" size={24} color={WHITE_TEXT_COLOR} />
                <Text style={{ color: WHITE_TEXT_COLOR, fontSize: 16, marginLeft: 5 }}>
                    Back to Itineraries
                </Text>
            </TouchableOpacity>
            
            <Text
                style={{
                    fontSize: 30,
                    fontWeight: "600",
                    color: WHITE_TEXT_COLOR,
                }}>
                AI Discovery
            </Text>
        </View>
        <View style={{flex:1}}>
                <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={{
                    flex:1,
                }}
                initialRegion={{
                    latitude: Number(lat),
                    longitude: Number(lng),
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                }}
                >
                
                    {suggestions.map((place, index) => (
                        <Marker
                        key={index}
                        coordinate={{latitude: place.lat, longitude: place.lng}}
                        title={place.name}
                        onPress={()=> {
                            setSelectedPlace(place)
                            bottomSheetRef.current?.close();
                        }
                        }

                        >

                        </Marker>
                    )) }
                </MapView>
                {selectedPlace && (
                                <View style={styles.popUpCard}>
                                  {/* Card Info */}
                                  <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 10}}>
                                    <TouchableOpacity
                                    onPress={() => {
                                        const newIndex = selectedIndex > 0 ? selectedIndex - 1 : suggestions.length - 1;
                                        setSelectedIndex(newIndex);
                                        setSelectedPlace(suggestions[newIndex])
                                        mapRef.current?.animateToRegion({
                                            latitude: suggestions[newIndex].lat,
                                            longitude: suggestions[newIndex].lng,
                                            latitudeDelta: 0.15,
                                            longitudeDelta: 0.01
                                        }, 500)
                                    }}
                                    >
                                        <Ionicons name="chevron-back-sharp" color="white" size={20}></Ionicons>
                                    </TouchableOpacity>
                                    <Text style={{color: WHITE_TEXT_COLOR, alignItems: 'center', fontSize: 13}}>
                                      {selectedIndex + 1} of 5
                                    </Text>
                                    <TouchableOpacity
                                    onPress={() => {
                                        const newIndex = selectedIndex < suggestions.length - 1 ? selectedIndex + 1 : 0;
                                        setSelectedIndex(newIndex);
                                        setSelectedPlace(suggestions[newIndex])
                                        mapRef.current?.animateToRegion({
                                            latitude: suggestions[newIndex].lat,
                                            longitude: suggestions[newIndex].lng,
                                            latitudeDelta: 0.15,
                                            longitudeDelta: 0.01
                                        }, 500)
                                    }}>
                                        <Ionicons name="chevron-forward-sharp" color="white" size={20}></Ionicons>
                                    </TouchableOpacity>
                                  </View>
                                  <View style={styles.cardHeader}>
                                    {/* SET THE PLACE NAME HERE */}
                                    <Text style={styles.cardTitle}>{selectedPlace?.place_name || "Selected Place"}</Text>  
                                    
                    
                                    {/* SET THE PLACE RATING HERE  */} 
                                    <Text style={styles.ratingText}>⭐️ {selectedPlace?.rating}</Text> 
                                  </View>
                                  <Text style={{color: "white", marginBottom: 6, fontSize: 12, alignContent: "flex-end"}}>{selectedPlace.place_address}</Text>

                                  {/* Card Image */}
                                  {/* SET THE PLACE IMAGE HERE */}
                                  <Image 
                                    source={{uri: selectedPlace.place_data.photo_url}}
                                    style={styles.cardImage} 
                                  />
                                    
                                  {/* Interactive Button Row */}
                                  
                                  <Text style={{color: "white", marginBottom: 10, fontSize: 13, fontStyle: "italic"}}>{selectedPlace.notes}</Text>
                                  <View style={styles.buttonRow}>
                                    
                                    
                                    {/* ADD TRIP BUTTON */}
                                    <TouchableOpacity 
                                      style={styles.addBtn}
                                      onPress={() => setIsAddTripVisible(true)}
                                    >
                                      <Text style={styles.btnText}>Add to Itinerary</Text>
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              )}
        <View>
        
        
        </View>
        {/* Dropdown Menu */}
       {/*  <View style={{ zIndex: 1000, position: 'relative', paddingHorizontal: 20, marginBottom: 20, height: 60, justifyContent: 'center' }}>
            <DropDownPicker
                multiple={true}   
                min={0}
                max={8} 
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setItems}
                style={{ backgroundColor: BACKGROUND_COLOR, borderWidth: 0, height: 50, justifyContent: 'center' }}
                textStyle={{ color: WHITE_TEXT_COLOR, fontWeight: 'bold', lineHeight: 24 }}
                dropDownContainerStyle={{ backgroundColor: SEARCH_BACKGROUND_COLOR, zIndex: 1000, maxHeight: 300 }}
                placeholder="What's your vibe?"
                zIndex={1000}
                zIndexInverse={1000}
                dropDownDirection="AUTO"
                showTickIcon={true}
                tickIconStyle={{ tintColor: WHITE_TEXT_COLOR }}
                showArrowIcon={true}
                arrowIconStyle={{ tintColor: WHITE_TEXT_COLOR }}
            />
        </View> */}

        {/* Main Content */}

        <BottomSheet
        ref={bottomSheetRef}
          snapPoints={["10%", "50%", "89%"]}
          index={2}
          onChange={handleSheetChange}
          
          backgroundStyle={{ backgroundColor: SECONDARY_BACKGROUND_COLOR }}>
            <BottomSheetScrollView
            contentContainerStyle={{ paddingVertical: 16, width: "100%", alignItems: "flex-end", justifyContent: "flex-start" }}
            style={{flex: 1, borderTopWidth: 1, borderBottomWidth: 1, borderTopColor: '#7691bc', borderBottomColor: '#7691bc' }}
            >
        {messages.length === 0 && (
            <View style={{alignSelf: "flex-start", padding: 10}}>
                <Text style={{color: WHITE_TEXT_COLOR, marginBottom: 20, fontWeight: 700 }}>Don't know what to ask? Try asking:</Text>
                {sampleMessages.map((query,index)=>(
                            <TouchableOpacity 
                            style={{borderRadius:16, backgroundColor: '#616161', padding: 10, marginBottom: 12}}
                            key={index}
                            onPress={() => setInputText(query)}>
                                <Text style={{fontStyle: "italic", color: WHITE_TEXT_COLOR}}>"{query}"</Text>
                            </TouchableOpacity>
                        ))}
            </View>

        )}
        {messages.map((message, index) => (
                    <View key={index} style={{ 
                    alignSelf: message.role === "user" ? "flex-end" : "flex-start", 
                    backgroundColor: message.role === "user" ? "#2c4eb5" : "#3e3f41", 
                    borderRadius: 16, padding: 14, marginBottom: 12, marginRight: 20, marginLeft:20, maxWidth: "85%" }}>
                        <Text style={{ color: WHITE_TEXT_COLOR, fontSize: 16, lineHeight: 22 }}>
                            {message.text}
                        </Text>
                        
                    </View>
                ))}
                </BottomSheetScrollView>
        {/* Input and Send Button at Bottom */}

        <View>
            {/* After receieving response, add an import itinerary button */}

        </View>
    </BottomSheet> 
    {isSheetOpen && !selectedPlace && (
    <View
            style={{position: "relative",flexDirection: "row", justifyContent: "center", height: 60, marginBottom:20, }}>
            <TextInput
                placeholder={`What are you looking for in ${destination}`}
                placeholderTextColor="gray"
                value={inputText}
                onChangeText={setInputText}
                multiline={true}
                style={{ flex: 1, backgroundColor: SEARCH_BACKGROUND_COLOR, color: WHITE_TEXT_COLOR, paddingHorizontal: 15, margin: 10, borderRadius: 5, }}>
            </TextInput>

            <TouchableOpacity
                onPress={handleSend}
                style={{ backgroundColor: "#2c4eb5", paddingHorizontal: 15, margin: 10, borderRadius: 5, justifyContent: 'center' }}>
                <Text style={{ color: WHITE_TEXT_COLOR, fontWeight: "900", fontSize: 16 }}>Send</Text>
            </TouchableOpacity>
        </View>)}
    </View>
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
            <Text style={styles.inputLabel}>Select Day:</Text> 
              {/* Add check for if trips are empty. If trips are empty, 
              don't show picker and show button to redirect to tripsList.tsx */}
            <Picker
                            selectedValue={selectedDay}
                            onValueChange={(value) => setSelectedDay(value)}
                            itemStyle={{height:120, fontSize: 14,}}
                            >
                                {Array.from({length: totalDays}, (_, i) => i+1).map((day) => (
                                    <Picker.Item
                                    key={day}
                                    label={`Day ${day}`}
                                    value={day}
                                    color="white"
                                    />
                                ))}

                            </Picker> 
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
                onPress={handleAdd}
>
                <Feather name="check" size={18} color="white" style={{marginRight: 8}} />
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal> 

    </SafeAreaView>
    
    
    
    
    
    )

}

const styles = StyleSheet.create({
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
    color: WHITE_TEXT_COLOR,
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
