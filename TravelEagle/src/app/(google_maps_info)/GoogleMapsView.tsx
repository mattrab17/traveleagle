import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { Marker } from "react-native-maps";
import { Text, View, Button, StyleSheet } from "react-native";
import { useEffect, useRef, useState } from "react";
import GooglePlacesInput from "./GooglePlacesAutocomplete";
import { animateToRegion, fitMarkerstoScreen } from "../../../controllers/mapController";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import useLocation from "../../../locationServices/geolocation";


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
};

export default function GoogleMapsView({
  mapRef,
  selectedPlace,
  setSelectedPlace,
  showSearchInput = true,
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <MapView
          ref={activeMapRef}
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
              onPress={() => animateToRegion(activeMapRef, place.lat, place.lng)}
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
        </MapView>
        {showSearchInput && (
          <GooglePlacesInput
            mapRef={activeMapRef}
            setSelectedPlace={activeSetSelectedPlace}
          />
        )}
        <View
          style={{
            position: "absolute",
            top: 180,
            right: 16,
            backgroundColor: "white",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          {/* Temp button no styling yet, just to test fitMarkers func*/}
          <Button title="📍" onPress={() => { 
            if (latitude != null && longitude != null && activeMapRef){
              animateToRegion(activeMapRef, latitude, longitude)
            }} }
            />
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
