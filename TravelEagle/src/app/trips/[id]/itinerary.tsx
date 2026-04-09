import { itineraryController } from "@/controllers/itineraryController";
import { tripController } from "@/controllers/tripController";
import {GooglePlacesInput, GooglePlacesInputTrip } from "@/src/app/(google_maps_info)/GooglePlacesAutocomplete";
import { Ionicons, Feather} from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, ScrollView, Alert, TextInput, StyleSheet, Platform } from "react-native";
import { Picker } from '@react-native-picker/picker'
import {
  BACKGROUND_COLOR,
  WHITE_TEXT_COLOR,
  ORANGE_COLOR,
  SECONDARY_BACKGROUND_COLOR,
  SEARCH_BACKGROUND_COLOR,
} from "../../constants/colors"
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';


export default function ItineraryScreen(){
    const { id } = useLocalSearchParams();
    const [itinerary, setItinerary] = useState<any>([]);
    const router = useRouter();
    const [selectedPlace, setSelectedPlace] = useState<any>(null);
    const [trip, setTrip] = useState<any>(null);
    const [selectedDay, setSelectedDay] = useState<number>(1);
    const totalDays = tripController.getTotalDays(trip);
    const [notes, setNotes] = useState<string>('');
    const [currentDay, setCurrentDay] = useState<number>(0);
    const itineraryForCurrentDay = currentDay === 0 ? itinerary : itinerary.filter(item => item.day_number === currentDay);
    const [searchBarVisible, setSearchBarVisible] = useState<boolean>(false);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [editItem, setEditItem] = useState<any>(null);
    const [editTime, setEditTime] = useState<Date | null>(null);
    const [addTime, setAddTime] = useState<Date>(new Date());
    const [editDay, setEditDay] = useState<number>(1);
    const [editNotes, setEditNotes] = useState<string>('');
    const [showAddTimePicker, setShowAddTimePicker] = useState(false);
    const [showEditTimePicker, setShowEditTimePicker] = useState(false);

    async function loadItinerary(){
            const {data} = await itineraryController.loadAllItems(Number(id));
            setItinerary(data)
            const {data: tripData } = await tripController.loadTrip(Number(id));
            setTrip(tripData);
            /* console.log(tripData)
            console.log(tripController.getTotalDays(tripData)) */
        }

    useEffect(() => {
        
    loadItinerary();}, [id]);

    // Converts "HH:MM:SS" into total minutes so we can sort times reliably.
    function timeSlotToMinutes(timeSlot?: string | null){
        if (!timeSlot) return Number.POSITIVE_INFINITY;
        const [hours = "0", minutes = "0"] = timeSlot.split(":");
        return Number(hours) * 60 + Number(minutes);
    }

    // Earlier times go first. If times are equal, keep insertion order_index.
    const sortedItineraryForCurrentDay = [...itineraryForCurrentDay].sort((a, b) => {
        const timeDiff = timeSlotToMinutes(a.time_slot) - timeSlotToMinutes(b.time_slot);
        if (timeDiff !== 0) return timeDiff;

        const orderA = typeof a.order_index === "number" ? a.order_index : Number.POSITIVE_INFINITY;
        const orderB = typeof b.order_index === "number" ? b.order_index : Number.POSITIVE_INFINITY;
        return orderA - orderB;
    });


    async function handleAddPlace(){
        if (!selectedPlace){
            Alert.alert('Select a place first');
            return;
        }

        const formattedTime = addTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false,
        });

        const {data, error} = await itineraryController.addPlaceFromGoogle(
            Number(id),
            selectedPlace,
            selectedDay,
            notes,
            formattedTime
        );
        if (error){
            Alert.alert('Error', 'Failed to add to itinerary');
            return;
        }

            loadItinerary();
            setSelectedPlace(null);
            setSelectedDay(1);
            setNotes('');
            setAddTime(new Date());
            setShowAddTimePicker(false);
            
    }

    async function handleDelete(itemId: number){
        Alert.alert(
            'Delete from Itinerary',
            'Are you sure you want to delete this item from your itinerary?',
            [
                {text: 'Cancel', style: 'cancel'},
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await itineraryController.deleteItemFromItinerary(itemId);
                        loadItinerary();
                    }
                }
            ]
        )
    }

    function handleEdit(item: any){
        setEditItem(item);
        setEditDay(item.day_number);
        setEditNotes(item.notes || '');
        if (item.time_slot){
            const [hours, minutes] = item.time_slot.split(':');
            const date = new Date();
            date.setHours(Number(hours), Number(minutes));
            setEditTime(date);
        }
        else{
            setEditTime(null);
        }
        setShowEditTimePicker(false);
        bottomSheetRef.current?.snapToIndex(1);
    }
    async function handleSaveEdits(){
        if (!editItem) return;

        const formattedTime = editTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false,
    });
    const {error} = await itineraryController.updateItem(editItem.id, {
        time_slot: formattedTime,
        day_number: editDay,
        notes: editNotes || null,
    })
    if (error) {
        Alert.alert('Error', 'failed to update item');
        return;
    }
    bottomSheetRef.current?.close();
    setEditItem(null);
    loadItinerary();
};
const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  };

const onTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // On Android, close picker after user action (set or cancel).
    if (Platform.OS === 'android') {
        setShowEditTimePicker(false);
    }
    if (event.type === 'dismissed') return;
    if (selectedDate) {
        setEditTime(selectedDate);
    }
  };

const onAddTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // On Android, close picker after user action (set or cancel).
    if (Platform.OS === 'android') {
        setShowAddTimePicker(false);
    }
    if (event.type === 'dismissed') return;
    if (selectedDate) {
        setAddTime(selectedDate);
    }
  };

const formatTimeSlot = (timeSlot) => {
    const date = new Date(`2026-07-27T${timeSlot}`);
    return formatTime(date);

}

    // Itinerary would be better suited with a calender styling that displays the time with the items placed
    //between their specific selected time slots.

    return(
        <GestureHandlerRootView style={{flex:1}}>
        <ScrollView keyboardShouldPersistTaps="handled">
        <View style={{padding: 20, marginTop:20, flex:1,}}>
            <TouchableOpacity onPress={() => router.back()} style={{marginTop:20}}><Ionicons name='arrow-back' size={16} color="white"/></TouchableOpacity>
        <View style={{paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            
            <Text style={{color: 'white', fontSize: 36, fontFamily:'Inter', fontWeight: 800}}>Itinerary</Text>
         
            {!searchBarVisible && (
                    <TouchableOpacity 
                    style={{
                        backgroundColor: 'white',
                        borderRadius: 10,
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                    }}
                    onPress={()=>setSearchBarVisible(true)}>
                        <Text>+ Add to Itinerary</Text>
                    </TouchableOpacity>
                )
                }
            </View>
               {/*SEARCH BAR*/}
            {searchBarVisible && (
        <View style={{marginTop: 30, backgroundColor:'white', borderRadius: 10, padding:15}}>
                <View style={{justifyContent:'space-between', flexDirection: 'row', marginBottom:10 }}>
                <Text style={{fontSize:18, fontWeight: 600, fontFamily: 'Inter', marginBottom: 10 }}>Add a place</Text>
                <TouchableOpacity 
                onPress={() => {
                    setSearchBarVisible(false);
                    setSelectedPlace(null);
                    setSelectedDay(1);
                    setNotes('');
                    setAddTime(new Date());
                    setShowAddTimePicker(false);
                }}>
                <Ionicons name="close-circle" size={20} color="red" />
                </TouchableOpacity>
                </View>
                {/* Update styling in Search bar later */}
                <View style={{zIndex: 5000, elevation: 5000}}>
                    <GooglePlacesInputTrip 
                    onSelect={(data, details) => {
                       // console.log('Selected:', details);
                        setSelectedPlace(details);
                    }}
                    placeholder="Search for a place">
                    </GooglePlacesInputTrip>
                </View>
            

            {/* Dropdown from searchbar*/}
                {selectedPlace && (
                    <View style={{marginTop:15}}>
                        {selectedPlace.photos && selectedPlace.photos[0] && (
                            <Image 
                            source={{
                                uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${selectedPlace.photos[0].photo_reference}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`

                            }}
                            style={{width:'100%', height: 120, borderRadius: 10}}>
                            </Image>
                        )
                    }
                        <View style={{paddingTop:20}}>
                        <Text style={{fontSize: 16, fontWeight:'600', fontFamily:'Inter',
                        }}>{selectedPlace.name}</Text>
                        <Text style={{fontSize: 12, fontWeight:'300', color: 'gray', fontFamily: 'Inter'}}>{selectedPlace.formatted_address}</Text>
                        <Text style={{marginTop: 20, fontSize: 14, fontFamily: 'Inter', fontWeight: '500' }}>Select Day</Text>
                        <View style={{borderRadius:8, backgroundColor: '#f6f6f6', height: 100, borderColor: '#ddd' }}>
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
                                    color="black"
                                    />
                                ))}

                            </Picker>    
                        </View>
                        <View style={{marginTop: 20, }}>
                            <Text style={{fontSize: 14, fontFamily: 'Inter', fontWeight: '500', marginBottom: 8}}>Select Time</Text>
                            <TouchableOpacity
                                style={{
                                   backgroundColor: '#f6f6f6',
                                   borderColor: '#ddd',
                                   borderRadius: 8,
                                   padding: 12,
                                   minHeight: 40,
                                   flexDirection: 'row',
                                   alignItems: 'center',
                                   justifyContent: 'space-between'
                                }}
                                onPress={() => setShowAddTimePicker(true)}
                            >
                                <Text style={{color: 'black'}}>{formatTime(addTime)}</Text>
                                <Feather name="clock" size={18} color="gray" />
                            </TouchableOpacity>
                            {showAddTimePicker && (
                                <View style={{
                                    alignItems:'center',
                                    marginTop: 8,
                                    backgroundColor: '#f6f6f6',
                                    borderRadius: 8,
                                    paddingVertical: 6
                                }}>
                                    <DateTimePicker
                                        value={addTime}
                                        mode="time"
                                        is24Hour={false}
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={onAddTimeChange}
                                        textColor="#111111"
                                    />
                                </View>
                            )}
                        </View>
                        <View style={{marginTop: 20, }}>
                            <Text> Notes (optional) </Text>
                            <TextInput
                            style={{
                               backgroundColor: '#f6f6f6',
                               borderColor: '#ddd',
                               borderRadius: 8,
                               padding: 12,
                               marginTop: 8,
                               minHeight: 40,
                               textAlignVertical: 'top'

                            }}
                            placeholder="Add any notes for this place"
                            value={notes}
                            onChangeText={setNotes}
                            multiline={true}
                            placeholderTextColor={'black'}
                            
                            />

                            
                        </View>
                        {/*Also add text box for any notes the user wants to leave on the itinerary item*/}
                        <TouchableOpacity
                            style={{
                                backgroundColor: ORANGE_COLOR,
                                padding:12,
                                borderRadius:8,
                                marginTop: 10,
                                alignItems: 'center'

                            }}
                            onPress={handleAddPlace}
                        >
                            <Text style={{color: 'white', fontWeight: '600', fontFamily: 'Inter'}}>
                                Add to Itinerary
                            </Text>

                        </TouchableOpacity>
                        </View>

                     </View>
                )}
        </View>
)}
        <View style={{paddingTop: 30, flex:1,  backgroundColor: 'whtie' }}>
            <ScrollView horizontal style={{marginBottom:20, marginTop: 20,}} showsHorizontalScrollIndicator={false}>
                <View style={{flexDirection: 'row', gap: 5}}>
                    <TouchableOpacity 
                        style={{borderRadius: 20, backgroundColor: currentDay === 0 ? ORANGE_COLOR : '#9E9E9E', paddingVertical: 10, paddingHorizontal:20, }}
                        onPress={()=>setCurrentDay(0)}>
                            <Text style={{color: WHITE_TEXT_COLOR}}>All</Text>
                        </TouchableOpacity>
                    {Array.from({length: totalDays}, (_, i) => i+1).map((day) => (
                        <TouchableOpacity 
                        style={{borderRadius: 20, backgroundColor: currentDay === day ? ORANGE_COLOR : '#9E9E9E', paddingVertical: 10, paddingHorizontal:20, }}
                        key={day}
                        onPress={()=>setCurrentDay(day)}
                        >
                            <Text style={{color: WHITE_TEXT_COLOR}}>Day {day}</Text>
                        </TouchableOpacity>
                                   
                                ))}
                    
                </View>
            </ScrollView>
            <FlatList
            data={sortedItineraryForCurrentDay}
            scrollEnabled={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({item}) => (
                <View style={{marginBottom: 10, flexDirection: 'row', alignItems: 'stretch', gap: 10}}>
                <View style={{width: 78, justifyContent: 'center', alignItems: 'flex-start', paddingTop: 8}}>
                    <Text style={{color: '#96a0ad', fontSize: 13, fontWeight: '600'}}>
                        {item.time_slot ? formatTimeSlot(item.time_slot) : '--:--'}
                    </Text>
                </View>
                <TouchableOpacity
                activeOpacity={0.85}
                onPress={() =>
                    router.push({
                        pathname: "/trips/[id]/place/[itemId]",
                        params: { id: String(id), itemId: String(item.id) },
                    })
                }
                style={{backgroundColor: 'white', padding:10, borderRadius: 10, flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                {item.place?.place_data?.photos && item.place.place_data.photos[0] && (
                     <Image 
                            source={{
                                uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${item.place.place_data.photos[0].photo_reference}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`

                            }}
                            style={{width:120, height: 80}}>
                            </Image>
                )
            }
                <View style={{flex: 1, paddingLeft: 15}}>
                <Text style={{fontSize:16, fontWeight: '500'}}>
                    {item.place.name}
                </Text>
                <Text style={{fontSize:10, paddingTop: 3}}>
                {item.place.address}
                </Text>
                {item.notes && (
                    <Text style={{fontSize: 12, fontStyle: 'italic', paddingTop: 10, color: '#6f6e6e'}}>{item.notes}</Text>
                )}
                </View>
                <View style={{
                    flexDirection:'row', position:'absolute', top:8, right: 8, gap: 4
                }
                }>
                    <TouchableOpacity onPress={()=> {handleEdit(item)}}>
                        <Ionicons name='settings-outline' size={15}></Ionicons>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=> handleDelete(item.id)}>
                        <Ionicons name='trash-outline' size={15} color='red'></Ionicons>
                    </TouchableOpacity>
                    
                </View>
                </TouchableOpacity>

                </View>
            )}
            ListEmptyComponent={
                <Text style={{color:'white', textAlign:'center'}}>
                    No items in your Itinerary yet.
                </Text>
            }
            >
            </FlatList>
        </View>
        </View>
        </ScrollView>
        <BottomSheet
        ref={bottomSheetRef}
        snapPoints={['50%']}
        index={-1}
        enablePanDownToClose={true}
        backgroundStyle={{backgroundColor: SECONDARY_BACKGROUND_COLOR}}>
        <BottomSheetView style={{padding:20,  flex:1}}>
        <Text style={{ fontSize: 22, color: ORANGE_COLOR, fontWeight:'800',}}>Edit Item</Text>
        <Text style={{ fontSize:14, color: "white", paddingVertical: 10, paddingBottom: 5, fontWeight:'400'
                     }}>{editItem?.place?.name}</Text>
                    <Text style={{fontSize: 12, marginBottom: 10, fontWeight: '400', color: 'gray'}}>{editItem?.place?.address}</Text>
                   
                    
        <ScrollView horizontal style={{marginBottom:20, marginTop: 20,}} showsHorizontalScrollIndicator={false}>
                <View style={{flexDirection: 'row', gap: 7}}>
                    {Array.from({length: totalDays}, (_, i) => i+1).map((day) => (
                        <TouchableOpacity 
                        style={{borderRadius: 20, backgroundColor: editDay === day ? ORANGE_COLOR : '#ffffff', paddingVertical: 10, paddingHorizontal:20, }}
                        key={day}
                        onPress={()=>setEditDay(day)}
                        >
                            <Text style={{color:  editDay === day ? 'white' : 'black', fontWeight: '600'}}>Day {day}</Text>
                        </TouchableOpacity>
                                   
                                ))}
                </View>
            </ScrollView>
            <Text style={styles.inputLabel}>Time</Text> 
            <TouchableOpacity 
              style={styles.itineraryInput}
              onPress={() => setShowEditTimePicker(true)}
            > 
              <Feather name="clock" size={20} color={'gray'} />
              <Text style={styles.inputText}>{editTime ? formatTime(editTime) : 'No time set'}</Text>
              
            </TouchableOpacity>
            {/* Time Scroller Component */}
            {showEditTimePicker && (
                <View style={{alignItems:'center'}}>
              <DateTimePicker
                value={editTime || new Date()}
                mode="time"
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onTimeChange}
                textColor="white"
              />
                </View>
            )}
        <View style={{marginTop: 10, }}>
                                    <Text style={{color: '#3CB371', fontWeight: '400' }}> Notes (optional) </Text>
                                    <TextInput
                                    style={{
                                       backgroundColor: '#f6f6f6',
                                       borderColor: '#ddd',
                                       borderRadius: 8,
                                       padding: 12,
                                       marginTop: 8,
                                       minHeight: 40,
                                       textAlignVertical: 'top'
        
                                    }}
                                    placeholder="Add any notes for this place"
                                    value={editNotes}
                                    onChangeText={setEditNotes}
                                    multiline={true}
                                    placeholderTextColor={'black'}
                                    
                                    />
    <TouchableOpacity
             style={{
                padding:10,
                backgroundColor: ORANGE_COLOR,
                borderRadius:8,
                alignContent: 'center',
                alignItems: 'center',
                marginTop:15,
            }}
            onPress={handleSaveEdits}
            >
                <Text style={{color: 'white', fontWeight: '600'}}>Save</Text>
            </TouchableOpacity>
    </View>
        </BottomSheetView>
        </BottomSheet>
        </GestureHandlerRootView>
        
    );
}

const styles = StyleSheet.create({ 
    inputLabel: { //input subheadings: "Select Itinerary:" & "Select Time"
    color: '#3CB371',
    fontSize: 14,
    marginBottom: 8,
  },
   itineraryInput: { //input box styling
    backgroundColor: '#f6f6f6', 
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal:20,
    flexDirection: 'row',
    gap:10,
    alignItems: 'center',
    marginBottom: 20,
  },
  inputText: { //inside input boxes: "Example Trip" & "12:00 AM"
    color: 'black',
    fontSize: 16,
  },
});
