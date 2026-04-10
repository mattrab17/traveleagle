import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { useEffect, useRef, useState } from "react";
import { animateToRegion, enrichPlaceFromMapPin } from "../../../controllers/mapController";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import useLocation from "../../../LocationServices/liveLocation";
import Feather from '@expo/vector-icons/Feather';
import MapViewDirections from 'react-native-maps-directions';

import { PlacesAPI } from "../../../LocationServices/PointOfInterest"
import { useRouter } from "expo-router";

type SelectedPlace = {
  name: string;
  lng: number;
  lat: number;
  description?: string;
  rating?: number;
  address?: string;
  website?: string;
  openHours?: string;
  crowdLevel?: string;
  photoUrl?: string;
  placeId?: string;
} | null;

type Place = {
  id: number;
  name: string;
  lng: number;
  lat: number;
  emoji: string;
  description?: string;
  placeId?: string;
  address?: string;
  popularity?: number;
};

type GoogleMapsViewProps = {
  mapRef?: React.RefObject<MapView | null>;
  selectedPlace?: SelectedPlace;
  setSelectedPlace?: React.Dispatch<React.SetStateAction<SelectedPlace>>;
  showSearchInput?: boolean;
  showDirections?: boolean;
  activeFilterCategories?: string[];
  onMarkerPress: (place: SelectedPlace) => void;
  //the place variable takes any data type: ID, title, etc
  //void is used to indicate the function doesn't return any value, it updates a state
};

export default function GoogleMapsView({
  //exported properties for usability
  mapRef,
  selectedPlace,
  setSelectedPlace,
  showSearchInput = true,
  showDirections = false,
  activeFilterCategories = [],
  onMarkerPress, //property for marker/pin event
}: GoogleMapsViewProps) {
  /* Template for daily itinerary --> Map view with Markers
    Gets list of places from db, [id, lat,long, etc..]
    pushes them to the places array, then array is mapped and rendered into MapView logic
  */

  const router = useRouter();
  
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
const [poiMarkers, setPoiMarkers] = useState<any[]>([]); //THIS CONTROLS THE STATE FOR RENDERING LISTS OF PLACES ON THE MAP
  const geo = useRef(new PlacesAPI()).current; //sets up the SearchTool PlacesAPI will use
  //useRef is the memory hook that will store search engine objects
  //      -> useRef is needed here to create a search engine object once so that this object will just rerender. Otherwise, it would create a new search engine object each time causing the app to lag and waste time on rendering

useEffect(() => { //useEffect -> a hook that helps render components (THE POINT OF THE CODE IS TO AUTOMATICALLY UPDATE LOCATIONS WHEN DIFFERENT FILTERS ARE ACTIVATED)
  
  const run = async () => { //run function
   
    try { //A try-catch block is used to prevent the code from crashing when a filter is not activated
      if (latitude == null || longitude == null) return; //if the app doesn't know the user's location yet, return nothing (do nothing)
      if (!Array.isArray(activeFilterCategories) || activeFilterCategories.length === 0) { //if no filters are selected, clear the map (setPOIMARKERS to an array filled with null)
        setPoiMarkers([]);
        return;
      }

      const poiResults = await geo.findPlaces({ //the search engine variable
                                                //poiResults calls findPlaces and searches for your location, your filters, a radius (25 miles), and a limit of 60 results
                                                //Await -> the code runs in the background and waits for results to come back before executing the code below
        userLocation: { latitude, longitude },
        selectedFilters: activeFilterCategories,
        radius: 40234,
        initialRadius: 2500,
        radiusStep: 5000,
        limit: 20,
      });

      setPoiMarkers(poiResults); //put poiResults into the setPoiMarkers array. (UPDATES THE SCREEN WITH PLACES)
    } catch (e) {
      console.error(e);
    }
  };
  run(); //run method is called to constantly wait for search engine info
}, [latitude, longitude, activeFilterCategories, geo]); //this code only runs when a variable changes. 
                                                        //Ex: if your location changes, then it will render different locations based on your latitude and longitude
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <MapView
          ref={activeMapRef}
          provider={PROVIDER_GOOGLE}
          onPress={(event) => {
            const action = (event?.nativeEvent as { action?: string })?.action;
            if (action === "marker-press") return;
            activeSetSelectedPlace(null);
            bottomSheetRef.current?.snapToIndex(2);
          }}

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
              onPress={async () =>
              {
                animateToRegion(activeMapRef, place.lat, place.lng);
                const enrichedPlace = await enrichPlaceFromMapPin(place);
                onMarkerPress(enrichedPlace);
                activeSetSelectedPlace(enrichedPlace);
                bottomSheetRef.current?.snapToIndex(1);
              }}
            >
              <View style={styles.customMarker}>
                <Text>{place.emoji}</Text>
              </View>
            </Marker>
          ))}

          {/* Draws Markers to the screen*/}
          {poiMarkers.map((p) => ( //.map function loops through the poiMarkers list. For every place, it renames the place 'p' and runs the code inside
            
            <Marker //this is an actual marker with it's attributes
              key={p.id}
              coordinate={{ latitude: p.latitude, longitude: p.longitude }}
              title={p.name}
              description={p.address}
              pinColor="blue"
              onPress={async () => { //this controls what happens when you press a marker
                const poiPlace = {
                  id: Number(p.id) || Date.now(),
                  name: p.name,
                  lat: p.latitude,
                  lng: p.longitude,
                  emoji: "📍",
                  description: p.address,
                };
                animateToRegion(activeMapRef, p.latitude, p.longitude); //populates the map with markers
                const enrichedPoi = await enrichPlaceFromMapPin({ //holds information such as: photos, reviews, open hours
                  //NOTE: The application does not need to receive location information unless a user presses on a specific marker
                  ...poiPlace,
                  address: p.address,
                  popularity: p.original?.properties?.rank?.popularity,
                });
                onMarkerPress(enrichedPoi);
                activeSetSelectedPlace(enrichedPoi);
                bottomSheetRef.current?.snapToIndex(1); //Pop out the bottomSheet with location info so that it takes up 25% of the screen
              }}
            />
          ))}
          
          {activeSelectedPlace && !isSelectedPlaceFromPresetMarkers && (
            <Marker 
              coordinate={{
                latitude: activeSelectedPlace.lat,
                longitude: activeSelectedPlace.lng,
              }}
              title={activeSelectedPlace.name}
            />
          )}

          {showDirections && origin != null && destination != null && GOOGLE_MAPS_APIKEY ? (
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
               <TouchableOpacity onPress={() => router.push("/(community)/CreatePostPage")}>
                <Text style={styles.bottomSheetDescription}>
                  Create a post
                </Text>
              </TouchableOpacity>
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
