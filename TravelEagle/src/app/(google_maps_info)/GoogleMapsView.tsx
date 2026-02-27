import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { Marker } from "react-native-maps";
import { Text, View, Button, StyleSheet, TouchableOpacity } from "react-native";
import { useEffect, useRef, useState } from "react";
import GooglePlacesInput from "./GooglePlacesAutocomplete";
import { animateToRegion, fitMarkerstoScreen } from "../../../controllers/mapController";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import useLocation from "../../../LocationServices/liveLocation"

import Feather from '@expo/vector-icons/Feather'; //import icon library
import MapViewDirections from 'react-native-maps-directions'

type SelectedPlace = {
  name: string;
  lng: number;
  lat: number;
  description?: string;
} | null;

type GoogleMapsViewProps = {
  mapRef?: React.RefObject<MapView | null>;
  selectedPlace?: SelectedPlace;
  setSelectedPlace?: React.Dispatch<React.SetStateAction<SelectedPlace>>;
  showSearchInput?: boolean;
  onMarkerPress: (place: any) => void;
  //the place variable takes any data type: ID, title, etc
  //void is used to indicate the function doesn't return any value, it updates a state
};

export default function GoogleMapsView({

  //exported functions for usability
  mapRef,
  selectedPlace,
  setSelectedPlace,
  showSearchInput = true,
  onMarkerPress, //function for marker/pin event
}: GoogleMapsViewProps) {
  /* Template for daily itinerary --> Map view with Markers
    Gets list of places from db, [id, lat,long, etc..]
    pushes them to the places array, then array is mapped and rendered into MapView logic
    */

  const internalMapRef = useRef<MapView | null>(null);
  const [internalSelectedPlace, internalSetSelectedPlace] = useState<SelectedPlace>(null);
  const activeMapRef = mapRef ?? internalMapRef;
  const activeSelectedPlace = selectedPlace ?? internalSelectedPlace;
  const activeSetSelectedPlace = setSelectedPlace ?? internalSetSelectedPlace;
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = ["25%", "50%", "4%"];

  const places = [
    { id: 1, name: "Times Square", lat: 40.758, lng: -73.9855, emoji: "🏙️" },
    { id: 2, name: "Central Park", lat: 40.7826, lng: -73.9656, emoji: "🌳" },
  ];

  const { latitude, longitude, errorMsg } = useLocation();
  
  useEffect(() => {
  if (latitude != null && longitude != null && activeMapRef.current) {
    animateToRegion(activeMapRef, latitude, longitude);
  }
  
}, [latitude, longitude]);

const origin = latitude != null && longitude != null
    ? { latitude, longitude } : undefined;
const destination = activeSelectedPlace 
    ? {latitude: activeSelectedPlace.lat, longitude:activeSelectedPlace.lng}
    : undefined;
const GOOGLE_MAPS_APIKEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <MapView
          ref={activeMapRef}
          provider={PROVIDER_GOOGLE}

          //Code to display user's location on map with an animated circle
          showsUserLocation={true} //shows the user where they are on the map
          followsUserLocation={true} //the map follows the dot as you move using your location
          showsMyLocationButton={false} //hide the default "show me location" button because we have a custom one


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
              
              onPress={() => //when a place is pressed, do this...
              {
                animateToRegion(activeMapRef, place.lat, place.lng);
                //renders marker/s to the map

                onMarkerPress(place);
                //handles what happens when you press a marker

                bottomSheetRef.current?.snapToIndex(1); //bottomsheet -> the marker popup information 

                //bottomSheetRef.current -> accesses the Bottom Sheet component
                //  useRef/Ref -> a hook that maintains a variable's value throughout screen rendering
                //  ? -> "Optional Chaining" indicator, 
                //    -it checks if the bottomsheet exists. if it does, run the command, otherwise, do nothing
                //    -Important because since refs are null until the screen fully loads, this prevents your app from breaking if a user triggers an event before the sheet is ready
                //snapToIndex -> instructs the component to move to the height at index 1 in the snapPoints array/ take up 25% of the screen

                

              }}
            >
              <View
                style={{
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

          {activeSelectedPlace && (
            <Marker
              coordinate={{
                latitude: activeSelectedPlace.lat,
                longitude: activeSelectedPlace.lng,
              }}
              title={activeSelectedPlace.name}
            />
          )}
            {origin !=null && destination != null ?
         
            <MapViewDirections
              origin={origin}
              destination={destination}
              apikey={GOOGLE_MAPS_APIKEY}
            /> : null}
        </MapView>
        {showSearchInput && (
          <GooglePlacesInput
            mapRef={activeMapRef}
            setSelectedPlace={activeSetSelectedPlace}
          />
        )}
        


        {/* ShowUserLocation Button */}
        <View
            style={{
              position: "absolute",
              top: 180,
              right: 16,
              backgroundColor: "white",
              borderRadius: 10,
              overflow: "hidden",
              // Add these for better icon centering:
              width: 44,
              height: 44,
              justifyContent: "center",
              alignItems: "center",
              
            }}
        >
          <TouchableOpacity 
            onPress={() => { 
              if (latitude != null && longitude != null && activeMapRef.current){
              animateToRegion(activeMapRef, latitude, longitude)
              }
            }}
          >
            <Feather name="navigation" size={24} color="#3858D6" /> 
          </TouchableOpacity>
        </View>

        
        <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints}>
          <BottomSheetView style={styles.contentContainer}>
            {activeSelectedPlace && (
              <View>
                <Text>{activeSelectedPlace.name}</Text>
                <Text>{activeSelectedPlace.description}</Text>
              </View>
            )}
          </BottomSheetView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "grey",
  },
  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: "center",
  },
  bottomSheetName: {
    flex: 1,
  },
});
