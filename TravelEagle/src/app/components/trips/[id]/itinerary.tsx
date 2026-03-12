import { itineraryController } from "@/controllers/itineraryController";
import {GooglePlacesInput, GooglePlacesInputTrip } from "@/src/app/(google_maps_info)/GooglePlacesAutocomplete";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, ScrollView, Alert } from "react-native";


export default function ItineraryScreen(){
    const { id } = useLocalSearchParams();
    const [itinerary, setItinerary] = useState<any>([]);
    const router = useRouter();
    const [selectedPlace, setSelectedPlace] = useState<any>(null);
    async function loadItinerary(){
            const {data} = await itineraryController.loadAllItems(Number(id));
            setItinerary(data)
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
            1
        );
        if (error){
            Alert.alert('Error', 'Failed to add to itinerary');
            return;
        }

        const {data: updatedData} = await itineraryController.loadAllItems(Number(id));
            setItinerary(updatedData)
            setSelectedPlace(null);
            console.log(updatedData)
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
        <View style={{padding: 20, marginTop:20, flex:1}}>
        <View style={{paddingTop: 60, }}>
            <Text style={{color: 'white', fontSize: 36, fontFamily:'Inter'}}>Itinerary</Text>
            </View>
            
        <View style={{marginTop: 30, backgroundColor:'white', borderRadius: 10, padding:15}}>
                <Text style={{fontSize:18, fontWeight: 400, fontFamily: 'Inter' }}>Add a place</Text>

                {/* Update styling in Search bar later */}
                <GooglePlacesInputTrip 
                onSelect={(data, details) => {
                    console.log('Selected:', details);
                    setSelectedPlace(details);
                }}
                placeholder="Search for a place">
                </GooglePlacesInputTrip>
            
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
                        <Text style={{fontSize: 16, fontWeight:'600', fontFamily:'Inter'
                        }}>{selectedPlace.name}</Text>
                        <Text style={{fontSize: 12, fontWeight:'300', color: 'gray', fontFamily: 'Inter'}}>{selectedPlace.formatted_address}</Text>
                        {/*Add picker for dayNumber later, it is default to dayNumber=0 for now.*/}
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
        <View style={{paddingTop: 30, flex:1,  backgroundColor: 'whtie' }}>
            <Text style={{color:'white', fontSize:20, marginBottom: 15}}>Your Itinerary</Text>
            <FlatList
            data={itinerary}
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
