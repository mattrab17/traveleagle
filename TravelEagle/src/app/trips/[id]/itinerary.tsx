import { itineraryController } from "@/controllers/itineraryController";
import { tripController } from "@/controllers/tripController";
import {GooglePlacesInput, GooglePlacesInputTrip } from "@/src/app/(google_maps_info)/GooglePlacesAutocomplete";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, ScrollView, Alert, TextInput } from "react-native";
import { Picker } from '@react-native-picker/picker'
import {
  BACKGROUND_COLOR,
  WHITE_TEXT_COLOR,
  ORANGE_COLOR,
  SECONDARY_BACKGROUND_COLOR,
  SEARCH_BACKGROUND_COLOR,
} from "../../constants/colors"


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

    async function loadItinerary(){
            const {data} = await itineraryController.loadAllItems(Number(id));
            setItinerary(data)
            const {data: tripData } = await tripController.loadTrip(Number(id));
            setTrip(tripData);
            console.log(tripData)
            console.log(tripController.getTotalDays(tripData))
        }

    useEffect(() => {
        
    loadItinerary();}, [id]);


    async function handleAddPlace(){
        if (!selectedPlace){
            Alert.alert('Select a place first');
            return;
        }

        const {data, error} = await itineraryController.addPlaceFromGoogle(
            Number(id),
            selectedPlace,
            selectedDay,
            notes
        );
        if (error){
            Alert.alert('Error', 'Failed to add to itinerary');
            return;
        }

            loadItinerary();
            setSelectedPlace(null);
            setSelectedDay(1);
            setNotes('');
            
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


    // Itinerary would be better suited with a calender styling that displays the time with the items placed
    //between their specific selected time slots.


    return(
        <ScrollView>
        <View style={{padding: 20, marginTop:20, flex:1,}}>
            <TouchableOpacity onPress={() => router.back()} style={{marginTop:20}}><Ionicons name='arrow-back' size={16} color="white"/> </TouchableOpacity>
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
                }}>
                <Ionicons name="close-circle" size={20} color="red" />
                </TouchableOpacity>
                </View>
                {/* Update styling in Search bar later */}
                <GooglePlacesInputTrip 
                onSelect={(data, details) => {
                   // console.log('Selected:', details);
                    setSelectedPlace(details);
                }}
                placeholder="Search for a place">
                </GooglePlacesInputTrip>
            

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
                                backgroundColor: 'green',
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
            <ScrollView horizontal style={{marginBottom:20, marginTop: 20,}}>
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
            data={itineraryForCurrentDay}
            scrollEnabled={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({item}) => (
                <View style={{backgroundColor: 'white', padding:10, borderRadius: 10, marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}>
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
                <Text style={{fontSize: 12, fontWeight: item.time_slot ? '200' : 'ultralight', color: item.time_slot ? '#000000' : '#919191', paddingTop: 10  }}>
                    Time: {item.time_slot}
                </Text>

                {item.notes && (
                    <Text style={{fontSize: 12, fontStyle: 'italic', paddingTop: 10, color: '#6f6e6e'}}>{item.notes}</Text>
                )}
                </View>
                <View style={{
                    flexDirection:'row', position:'absolute', top:8, right: 8, gap: 4
                }
                }>
                    <TouchableOpacity onPress={()=> {}}>
                        <Ionicons name='settings-outline' size={15}></Ionicons>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=> handleDelete(item.id)}>
                        <Ionicons name='trash-outline' size={15} color='red'></Ionicons>
                    </TouchableOpacity>
                    
                </View>

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
    );
}
