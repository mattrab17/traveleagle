import { useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import GooglePlacesInput from "././(google_maps_info)/GooglePlacesAutocomplete";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function TripsScreen() {
  const mapRef = useRef(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [trips, setTrips] = useState([
    {
      trip_id: 1,
      destination: "New York City, USA",
      start_date: "2026-02-11",
      end_date: "2026-02-12",
    },
    {
      trip_id: 2,
      destination: "New York, USA",
      start_date: "2026-02-11",
      end_date: "2026-02-14",
    },
    {
      trip_id: 3,
      destination: "New, USA",
      start_date: "2026-02-11",
      end_date: "2026-02-13",
    },
  ]);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 20, marginVertical: 40 }}>
        <Text
          style={{
            fontSize: 30,
            marginBottom: 20,
            color: "white",
          }}
        >
          My Trips
        </Text>
        <FlatList
          data={trips}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                padding: 20,
                backgroundColor: "white",
                borderRadius: 10,
                borderBottomWidth: 1,
                marginBottom: 10,
              }}
            >
              <Text style={{ fontSize: 18 }}>{item.destination}</Text>
              <Text style={{ color: "gray" }}>
                {item.start_date} - {item.end_date}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
      <BottomSheet 
            ref={bottomSheetRef}
            snapPoints={["2%", "25%", "50%", '89%']}
            index={0} 
            style={{flex:1}}
            backgroundStyle={{backgroundColor: 'white'}}>

        <BottomSheetView style={styles.contentContainer}>
            <Text style={{ fontSize: 20, color: "black" }}>Add a Trip</Text>
            <Text style={{ fontSize:16, color: "black", paddingVertical: 20 }}>Plan out your new trip by building an Itinerary</Text>
            <View style={{flex:1, width:'100%', paddingVertical: 40}}>
            <Text>
            Select A Location
            </Text>
            {/* Need to fix googlePlacesInput / make new function of it for this screen  */}
            <GooglePlacesInput>
            </GooglePlacesInput>    
            </View>
            <View style={{flex:1, width:'100%', paddingVertical: 40}}>
            <Text>
            Dates
            </Text>
            {/* Need to add Date Picker / Date Range Picker */}
            </View>
        </BottomSheetView>
      </BottomSheet>
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
