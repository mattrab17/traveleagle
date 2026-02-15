import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import TripForm from './components/TripForm'
import { tripController } from "@/controllers/tripController";

export default function TripsScreen() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [trips, setTrips] = useState<any[]>([]);
    /* {
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
  ]); */
  function closeSheet(){
    bottomSheetRef.current?.close();
    loadTrips();
  }
  useEffect(() => {
    loadTrips();}, []);

    const  userID = 'bde439b9-f312-45af-81b2-f07e1ee74648';
    async function loadTrips(){
      const {data} = await tripController.loadAllTrips(userID);
      setTrips(data);

    }

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
            <TripForm onClose={closeSheet} />
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
