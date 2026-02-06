import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { Marker } from "react-native-maps";
import { Text, View, Button, StyleSheet } from "react-native";
import { useRef, useState } from "react";
import {GooglePlacesAutocomplete} from "react-native-google-places-autocomplete";
import GooglePlacesInput from "./GooglePlacesAutocomplete";
import { animateToRegion, fitMarkerstoScreen } from "../../../controllers/mapController";
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


export default function GoogleMapsView() {
  /* Template for daily itinerary --> Map view with Markers
    Gets list of places from db, [id, lat,long, etc..]
    pushes them to the placaes array, then array is mapped and renedered into MapView logic
    */

  const mapRef = useRef(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = ['25%', '50%'];
  
  const places = [
    {id: 1, name: 'Times Square', lat: 40.7580, lng: -73.9855, emoji:'🏙️'},
    {id: 2, name: 'Central Park', lat: 40.7826, lng: -73.9656, emoji:'🌳'},
  ];

  return (
    <GestureHandlerRootView style={{flex: 1}}>
    <View style={{flex:1}}>
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      initialRegion={{
        latitude: 40.77892,
        longitude: -73.96836,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }}
      style={{ flex: 1 }}
    >
      {places.map((place) => (
        <Marker
          coordinate={{ latitude: place.lat, longitude: place.lng }}
          title={place.name}
          key={place.id}
          onPress={() => animateToRegion(mapRef, place.lat, place.lng)}
        >
          <View
            style={{
              /* Need to make a fixed size when zooming and zooming out later */
              width: 27,
              height: 27,
              borderRadius: 15,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "white",
            }}
          >
            <Text>{place.emoji}</Text>
          </View> 
        </Marker>
      ))}
      {selectedPlace &&(
        <Marker
          coordinate={{
            latitude: selectedPlace.lat,
            longitude: selectedPlace.lng
          }}
          title={selectedPlace.name}
          
          />
      )
    }
      </MapView>
      <GooglePlacesInput
        mapRef={mapRef}
        setSelectedPlace = {setSelectedPlace}/>
        <View style={{position: 'absolute', top:180, right: 16, backgroundColor: 'white', borderRadius:10, overflow: 'hidden'}}>
          {/* Temp button no styling yet, just to test fitMarkers func*/}
              <Button
                title= "📍"
                onPress={() => fitMarkerstoScreen(mapRef, places)}/>
        </View>
        <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
      >
        <BottomSheetView style={styles.contentContainer}>
          {selectedPlace &&(
            <View>
              <Text>{selectedPlace.name}</Text>
              <Text>{selectedPlace.description}</Text>
            </View>
          )}

        </BottomSheetView>
      </BottomSheet>
    </View>
    </GestureHandlerRootView>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'grey',
  },
  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: 'center',
  },
  bottomSheetName: {
    flex:1,
    
  }
});

