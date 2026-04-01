import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  SectionList,
} from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import TripForm from '../trips/TripForm'
import { tripController } from "@/controllers/tripController";
import { router } from "expo-router";
import { useAuth } from "../(authentication)/Auth";
import {
  BACKGROUND_COLOR,
  WHITE_TEXT_COLOR,
  ORANGE_COLOR,
  SECONDARY_BACKGROUND_COLOR,
  SEARCH_BACKGROUND_COLOR,
} from "../constants/colors"
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";

export default function TripsScreen() {
  const {user} = useAuth();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [sections, setSections]= useState<any[]>([]);
  function formatDate(date: string): string {
    const newDate = new Date(date)
    return newDate.toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }
    );
  }
  


  function closeSheet(){
    bottomSheetRef.current?.close();
    loadTrips();
  }

  useEffect(() => {
    if(user?.id){
    loadTrips();}}, [user]);

    /* useEffect(() => {
    loadTrips();}, []);
    const  userID = 'bde439b9-f312-45af-81b2-f07e1ee74648'; */
    async function loadTrips(){
      const {data} = await tripController.loadAllTrips(user.id);
      setSections(tripController.getSortedTripList(data));

    }
     /* async function loadTrips(){
      const {data} = await tripController.loadAllTrips(userID);
      setTrips(data);

    }
 */
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>  
    <SafeAreaView style={{ flex: 1, backgroundColor: BACKGROUND_COLOR }}>
    <View
                style={{
                  backgroundColor: "BACKGROUND_COLOR",
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  paddingBottom: 20,
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    // source={require("../../assets/images/traveleaglelogo.png")}
                    source={require("../../../assets/images/traveleaglelogo.png")}
                    style={{
                      width: 50,
                      height: 50,
                      marginRight: 10,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 30,
                      fontWeight: "600",
                      color: WHITE_TEXT_COLOR,
                    }}
                  >
                    My Trips
                  </Text>
                </View>
                <TouchableOpacity
        onPress={() => bottomSheetRef.current?.snapToIndex(3)}
          style={{
            backgroundColor: SECONDARY_BACKGROUND_COLOR,
            padding: 10,
            borderRadius: 4,
            alignItems: "center",
          }}
        >
          <AntDesign name="plus" size={36} color="white" />
        </TouchableOpacity>
                </View>
                 
      
      <View style={{ flex: 1, padding: 20, backgroundColor: SECONDARY_BACKGROUND_COLOR}}>
       {/*  <Text
          style={{
            fontSize: 30,
            marginBottom: 20,
            color: "white",
          }}
        >
          My Trips
        </Text> */}
       {sections.length === 0 ? (
        <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <TouchableOpacity
              onPress={() =>
                router.push("/(main_navigation)/(itinerary)/AiItineraryMaker")}
              style={{
                paddingVertical: 20,
                borderRadius: 15,
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              <AntDesign
                name="calendar"
                size={74}
                color={SEARCH_BACKGROUND_COLOR}
              />
              <Text
                style={{
                  fontSize: 18.5,
                  fontWeight: "700",
                  color: SEARCH_BACKGROUND_COLOR,
                }}
              >
                No trips yet
              </Text>
            </TouchableOpacity>
            </View>
       ): (
        <SectionList
          sections={sections}
          showsVerticalScrollIndicator={false}
          renderSectionHeader={({section})=>(
            <Text style={{
              color: WHITE_TEXT_COLOR,
              fontWeight:'700',
              fontSize: 20,
              paddingVertical: 12,
              paddingLeft: 10,
            

            }}
            >{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                padding: 20,
                backgroundColor: "#0e1e38",
                borderRadius: 10,
                borderWidth: 0.75,
                borderColor: "#96a0ad",
                borderBottomWidth: 1,
                marginBottom: 10,
              }}
              onPress={() => router.push(`/trips/${item.trip_id}/itinerary`)}
            >
              <View style={{flexDirection:'row', justifyContent: 'space-between'}}>
              <Text style={{ fontSize: 20, color: WHITE_TEXT_COLOR, fontWeight: '600' }}>Trip to {item.destination}</Text>
              <Text style={{fontSize: 14, color: ORANGE_COLOR}}>{tripController.getTotalDays(item)} Days</Text>
              </View>
              <Text style={{ color: WHITE_TEXT_COLOR, fontSize: 14, marginTop: 5 }}>
                {formatDate(item.start_date)} - {formatDate(item.end_date)}
              </Text>
            </TouchableOpacity>
          )}
        />
       )}
      </View>
      <BottomSheet 
            ref={bottomSheetRef}
            snapPoints={["2%", "25%", "50%", '89%']}
            index={-1} 
            style={{flex:1}}
            enablePanDownToClose={true}
            backgroundStyle={{backgroundColor: SECONDARY_BACKGROUND_COLOR}}>
                       
        <BottomSheetView style={styles.contentContainer}>
            <TripForm onClose={closeSheet} userId={user?.id} />
        </BottomSheetView>
      </BottomSheet>
      </SafeAreaView>
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