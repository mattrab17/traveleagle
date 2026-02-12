

import { useRef, useState } from 'react'
import {View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native'
import {GooglePlacesAutocomplete} from "react-native-google-places-autocomplete";
import GooglePlacesInput from "././(google_maps_info)/GooglePlacesAutocomplete";

export default function TripsScreen(){
const mapRef = useRef(null);
const [selectedPlace, setSelectedPlace] = useState(null);

const [trips, setTrips] = useState([
    {trip_id: 1, destination: 'New York City, USA', start_date: '2026-02-11', end_date: '2026-02-12'},
    {trip_id: 2, destination: 'New York, USA', start_date: '2026-02-11', end_date: '2026-02-14'},
    {trip_id: 3, destination: 'New, USA', start_date: '2026-02-11', end_date: '2026-02-13'}

])
return(
    <View style={{flex:1, padding:20, marginVertical: 40}}>
    <Text style={{
        fontSize: 30,
        marginBottom: 20,
        color: "white"
    }}>My Trips</Text>
    <FlatList
        data={trips}
        renderItem={ ({ item }) => (
            <TouchableOpacity style={{padding: 20, backgroundColor: 'white', borderRadius: 10, borderBottomWidth:1, marginBottom: 10}}>
                <Text style={{fontSize: 18}}>{item.destination}</Text>
                <Text style={{color: 'gray'}}>{item.start_date} - {item.end_date} </Text>
            </TouchableOpacity>
            )}
            />
    </View>)}