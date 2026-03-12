import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { useEffect, useRef, useState } from "react";
import { animateToRegion } from "../../../controllers/mapController";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import useLocation from "../../../LocationServices/liveLocation";
import Feather from '@expo/vector-icons/Feather';
import MapViewDirections from 'react-native-maps-directions';

import { PlacesAPI } from "../../../LocationServices/PointOfInterest"

type SelectedPlace = {
  name: string;
  lng: number;
  lat: number;
  description?: string;
} | null;

type Place = {
  id: number;
  name: string;
  lng: number;
  lat: number;
  emoji: string;
  description?: string;
};

type GoogleMapsViewProps = {
  mapRef?: React.RefObject<MapView | null>;
  selectedPlace?: SelectedPlace;
  setSelectedPlace?: React.Dispatch<React.SetStateAction<SelectedPlace>>;
  showSearchInput?: boolean;
  onMarkerPress: (place: Place) => void;
  //the place variable takes any data type: ID, title, etc
  //void is used to indicate the function doesn't return any value, it updates a state
};

export default function GoogleMapsView({
  //exported properties for usability
  mapRef,
  selectedPlace,
  setSelectedPlace,
  showSearchInput = true,
  onMarkerPress, //property for marker/pin event
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

  const bottomSheetRef = useRef<BottomSheet>(null); //constant that aids in controlling the rendering for the bottom sheet
  const snapPoints = ["12%", "25%", "4%"];

  const places: Place[] = [
    { id: 1, name: "Times Square", lat: 40.758, lng: -73.9855, emoji: "🏙️", description: "Busy city lights and entertainment." },
    { id: 2, name: "Central Park", lat: 40.7826, lng: -73.9656, emoji: "🌳", description: "A peaceful green space in the city." },
  ];

  const { latitude, longitude } = useLocation();
  
  useEffect(() => {
    if (latitude != null && longitude != null && activeMapRef.current) {
      animateToRegion(activeMapRef, latitude, longitude);
    }
  }, [latitude, longitude, activeMapRef]);

  const origin = latitude != null && longitude != null
    ? { latitude, longitude }
    : undefined;

  const destination = activeSelectedPlace
    ? { latitude: activeSelectedPlace.lat, longitude: activeSelectedPlace.lng }
    : undefined;

  const GOOGLE_MAPS_APIKEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  const isSelectedPlaceFromPresetMarkers = activeSelectedPlace
    ? places.some(
        (place) =>
          place.lat === activeSelectedPlace.lat &&
          place.lng === activeSelectedPlace.lng &&
          place.name === activeSelectedPlace.name
      )
    : false;

//code for the markers from GeoApify
const [poiMarkers, setPoiMarkers] = useState<any[]>([]);
const [category, setCategory] = useState("leisure.park");
const geo = useRef(new PlacesAPI()).current;//useRef will allow the markers to stay on the map without ReRendering everytime

useEffect(() => {
  const run = async () => {
    try {
      if ((latitude == null || longitude == null) && !activeSelectedPlace) return;
      const poiResults = await geo.findPlaces({
        userLocation: { latitude, longitude },
        searchedPlace: activeSelectedPlace,
        category,
        radius: 2500,
        limit: 20,
      });

      setPoiMarkers(poiResults);
    } catch (e) {
      console.error(e);
    }
  };
  run();
}, [latitude, longitude, activeSelectedPlace, category]);
  
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
              onPress={() =>
              {
                animateToRegion(activeMapRef, place.lat, place.lng);
                onMarkerPress(place);
                activeSetSelectedPlace(place);
                bottomSheetRef.current?.snapToIndex(1);
              }}
            >
              <View style={styles.customMarker}>
                <Text>{place.emoji}</Text>
              </View>
            </Marker>
          ))}

          {activeSelectedPlace && !isSelectedPlaceFromPresetMarkers && (
           {/* POI Markers*/}
  {poiMarkers.map((p) => (
  <Marker
    key={p.id}
    coordinate={{ latitude: p.latitude, longitude: p.longitude }}
    title={p.name}
    description={p.address}
    pinColor="blue"
    onPress={() => {
      onMarkerPress(p.original);
    }}
  />
))}
          
          {activeSelectedPlace && ( //if user selects a marker
            <Marker 
              coordinate={{
                latitude: activeSelectedPlace.lat,
                longitude: activeSelectedPlace.lng,
              }}
              title={activeSelectedPlace.name}
            />
          )}

          {origin != null && destination != null && GOOGLE_MAPS_APIKEY ? (
            <MapViewDirections
              origin={origin}
              destination={destination}
              apikey={GOOGLE_MAPS_APIKEY}
              strokeWidth={4}
              strokeColor="#3858D6"
            />
          ) : null}
        </MapView>

        {/* ShowUserLocation Button */}
        <View style={styles.locationButtonContainer}>
          <TouchableOpacity 
            style={styles.locationButton}
            onPress={() => { 
              if (latitude != null && longitude != null && activeMapRef.current) {
                animateToRegion(activeMapRef, latitude, longitude);
              }
            }}
          >
            <Feather name="navigation" size={24} color="#3858D6" /> 
          </TouchableOpacity>
        </View>

        <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints} index={2}>
          <BottomSheetView style={styles.contentContainer}>
            {activeSelectedPlace ? (
              <View style={styles.bottomSheetInner}>
                <Text style={styles.bottomSheetTitle}>{activeSelectedPlace.name}</Text>
                <Text style={styles.bottomSheetDescription}>
                  {activeSelectedPlace.description ? activeSelectedPlace.description : "No description yet."}
                </Text>
              </View>
            ) : (
              <Text style={styles.bottomSheetDescription}>Tap a marker to see the place.</Text>
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
    padding: 20,
    alignItems: "center",
  },
  bottomSheetInner: {
    width: "100%",
    alignItems: "center",
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#0A1931",
  },
  bottomSheetDescription: {
    fontSize: 14,
    color: "#444",
    textAlign: "center",
  },
  bottomSheetName: {
    flex: 1,
  },
  customMarker: {
    width: 27,
    height: 27,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  locationButtonContainer: {
    position: "absolute",
    top: 180,
    right: 16,
  },
  locationButton: {
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },

  
});