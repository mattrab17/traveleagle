import {
  Text,
  Image,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import {
  BACKGROUND_COLOR,
  WHITE_TEXT_COLOR,
  ORANGE_COLOR,
  SECONDARY_BACKGROUND_COLOR,
  SEARCH_BACKGROUND_COLOR,
} from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useState } from "react";

export default function ItineraryPage() {
  const router = useRouter();
  const [showNameItin, setShowNameItin] = useState(false); 
  const [itinName, setItinName] = useState("");
  const [activityName, setActivityName] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [showItin, setShowItin] = useState(false); 
  const [showActivityCreation, setShowActivityCreation] = useState(false);


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BACKGROUND_COLOR }}>
      {/* Header */}
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
            source={require("../../../../assets/images/traveleaglelogo.png")}
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
            My Itineraries
          </Text>
        </View>

        <TouchableOpacity
        onPress={() => router.push("/(main_navigation)/(itinerary)/AiItineraryMaker")}
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

      {/* Main Content */}
      <View
        style={[
          {
            flex: 1,
            backgroundColor: SECONDARY_BACKGROUND_COLOR,
            alignItems: "center",
            paddingHorizontal: 15,
          },
          showItin
            ? { justifyContent: "flex-start", paddingTop: 20 }
            : { justifyContent: "center" },
        ]}
      >
        {showItin ? (
          // *** Third page placeholder ***
          showActivityCreation ? (
            // activity creation state
            <View style={{ width: "100%" }}>
              <View style={{backgroundColor:"#0e1e38", padding: 20, borderRadius: 15, width: "100%", borderColor: "#96a0ad", borderWidth: 0.75, marginBottom: 20, justifyContent:"flex-start", alignItems:"flex-start"}}>
                  <Text style={{ color: WHITE_TEXT_COLOR, fontSize: 22, fontWeight: "800" }}>
                  {itinName}
                  </Text>
              
                  <Text style={{ color: WHITE_TEXT_COLOR, fontSize: 15, fontWeight: "500" }}>
                  Plan your day from midght to midnight!
                  </Text>
              </View>

              <View style={{backgroundColor:"#0e1e38", padding: 20, borderRadius: 15, width: "100%", borderColor: ORANGE_COLOR, borderWidth: 0.75}}>
                    <Text style={{ color: WHITE_TEXT_COLOR, fontSize: 20, fontWeight: "500", paddingBottom: 10 }}>
                      Add Activity
                    </Text>
                    <Text style={{ color: WHITE_TEXT_COLOR, fontSize: 15, fontWeight: "500", paddingBottom: 3 }}>
                      Time
                    </Text>
                    <TextInput 
                        value={"12:00 PM"}
                        style={{padding: 10, backgroundColor: "#262a2f", borderRadius: 5, color: WHITE_TEXT_COLOR}}></TextInput>
                    <Text style={{ color: WHITE_TEXT_COLOR, fontSize: 15, fontWeight: "500", paddingBottom: 3, paddingTop: 10 }}>Activity</Text>
                    <TextInput 
                    value={activityName} 
                    onChangeText={setActivityName}
                    placeholder="What are you doing?"
                    placeholderTextColor="gray"
                    style={{padding: 10, backgroundColor: "#262a2f", borderRadius: 5, color: WHITE_TEXT_COLOR}}></TextInput>
                    <Text style={{ color: WHITE_TEXT_COLOR, fontSize: 15, fontWeight: "500", paddingBottom: 3, paddingTop: 10 }}>Description</Text>
                    <TextInput value={activityDescription}
                    onChangeText={setActivityDescription}
                    placeholder="Add details..."
                    placeholderTextColor="gray"
                    style={{paddingTop: 10,paddingLeft: 10,paddingRight: 10,paddingBottom: 20, backgroundColor: "#262a2f", borderRadius: 5, color: WHITE_TEXT_COLOR}}></TextInput>
              
              
              <View style={{flexDirection: "row", paddingTop: 10, justifyContent: "space-between"}}>
                <TouchableOpacity>
                <Text style={{ color: WHITE_TEXT_COLOR, fontSize: 15, fontWeight: "700", backgroundColor: "#2c4eb5", padding: 13,paddingLeft: 108,paddingRight: 108, borderRadius: 5 }}>
                  Add
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowActivityCreation(false)}
              >
                <Text style={{ color: WHITE_TEXT_COLOR, fontSize: 15, fontWeight: "300", backgroundColor: "#262a2f", padding: 13, borderRadius: 5 }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              </View>
              

              </View>
            </View>
          ) : (
            // regular third page (before adding activity)
            <View style={{ width: "100%" }}>
              <View style={{backgroundColor:"#0e1e38", padding: 20, borderRadius: 15, width: "100%", borderColor: "#96a0ad", borderWidth: 0.75, marginBottom: 20, justifyContent:"flex-start", alignItems:"flex-start"}}>
                  <Text style={{ color: WHITE_TEXT_COLOR, fontSize: 22, fontWeight: "800" }}>
                  {itinName}
                  </Text>
              
                  <Text style={{ color: WHITE_TEXT_COLOR, fontSize: 15, fontWeight: "500" }}>
                  Plan your day from midght to midnight!
                  </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowActivityCreation(true)}
                style={{
                  backgroundColor:"#0e1e38",
                  width: "100%",
                  paddingVertical: 20,
                  borderRadius: 15,
                  alignItems: "center",
                  borderColor: "#4c5158", 
                  borderWidth: 0.75,
                }}
              >
                <Text style={{ fontSize: 14.5, fontWeight: "900", color: "#96a0ad" }}>
                  + Add Activity
                </Text>
              </TouchableOpacity>
            </View>
          )


) : !showNameItin ? (
          <>
            {/* First State */}
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
                No itineraries yet
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                router.push("/(main_navigation)/(itinerary)/AiItineraryMaker")
              }
              style={{
                backgroundColor: ORANGE_COLOR,
                width: "100%",
                paddingVertical: 20,
                borderRadius: 15,
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              <Text
                style={{ fontSize: 14.5, fontWeight: "900", color: "white" }}
              >
                Create Itinerary with AI
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowNameItin(!showNameItin)}
              style={{
                backgroundColor: "#2c4eb5",
                width: "100%",
                paddingVertical: 20,
                borderRadius: 15,
                alignItems: "center",
              }}
            >
              <Text
                style={{ fontSize: 14.5, fontWeight: "900", color: "white" }}
              >
                Create Manually
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* New Itinerary Form */}

        <View
        
          style={{
            backgroundColor: "#0e1e38",
            padding: 20,
            borderRadius: 15,
            width: "100%",
            borderColor: "#96a0ad",
            borderWidth: 0.75,
          }}
        >
            <Text
              style={{
                color: "white",
                fontSize: 22,
                fontWeight: "400",
                marginBottom: 20,
                paddingTop: 5,
              }}
            >
              Create a New Itinerary
            </Text>
            
            <TextInput
              value={itinName}
              //onChangeText={(text) => setItinName(text)}
              onChangeText={setItinName}
              placeholder="Enter itinerary name..."
              placeholderTextColor="gray"
              style={{
                backgroundColor: "#1a2f4e",
                width: "100%",
                padding: 24,
                borderRadius: 10,
                marginBottom: 20,
                fontSize: 16,
                color: "white",
              }}
            />
            
            
            <TouchableOpacity
              onPress={() => {
                setShowNameItin(false);
                setShowItin(true); // transition to third page after saving
                // you can also do something with itinName here
              }}
              style={{
                backgroundColor: "#2c4eb5",
                width: "100%",
                paddingVertical: 20,
                borderRadius: 15,
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "500", color: "white", fontSize: 16 }}>
                Save Itinerary
              </Text>
            </TouchableOpacity>


            <TouchableOpacity
              onPress={() => setShowNameItin(false)}
              style={{
                backgroundColor: "#1a2f4e",
                width: "100%",
                paddingVertical: 20,
                borderRadius: 15,
                alignItems: "center",
                marginTop: 20,
              }}
            >
              <Text style={{ fontWeight: "500", color: "white", fontSize: 16 }}>
                Cancel
              </Text>
            </TouchableOpacity>
        
        </View>      
          </>
        )}
      </View>
    </SafeAreaView>
  );
}