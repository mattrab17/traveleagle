import {
  Text,
  Image,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
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
  const [activityHour, setActivityHour] = useState("");
  const [activityMinute, setActivityMinute] = useState("");
  const [activityPeriod, setActivityPeriod] = useState<boolean | null>(null); // true = AM, false = PM, null = not selected
  const [errorMessage, setErrorMessage] = useState("");
  const [activities, setActivities] = useState<Array<{
    id: string;
    name: string;
    description: string;
    hour: number;
    minute: number;
    period: boolean; // true = AM, false = PM
  }>>([]);
  const [showItin, setShowItin] = useState(false); 
  const [showActivityCreation, setShowActivityCreation] = useState(false);
  const [showAddedActivity, setShowAddedActivity] = useState(false); 

  const sanitizeNumber = (text: string) => text.replace(/[^0-9]/g, "");

  const handleHourChange = (text: string) => {
    const cleaned = sanitizeNumber(text).slice(0, 2);
    if (!cleaned) {
      setActivityHour("");
      return;
    }

    const numeric = parseInt(cleaned, 10);
    if (numeric > 12) {
      setActivityHour("12");
      return;
    }

    setActivityHour(String(numeric));
    setErrorMessage("");
  };

  const handleMinuteChange = (text: string) => {
    const cleaned = sanitizeNumber(text).slice(0, 2);
    if (!cleaned) {
      setActivityMinute("");
      return;
    }

    const numeric = parseInt(cleaned, 10);
    if (numeric > 59) {
      setActivityMinute("59");
      return;
    }

    // Preserve the user's input format (e.g., "00" stays "00", "0" becomes "0")
    setActivityMinute(cleaned);
    setErrorMessage("");
  };

  const getFormattedTime = () => {
    if (!activityHour || !activityMinute || activityPeriod === null) return "";
    const h = activityHour.padStart(2, "0");
    const m = activityMinute.padStart(2, "0");
    const period = activityPeriod ? "AM" : "PM";
    return `${h}:${m} ${period}`;
  };

  // Convert 12-hour time to 24-hour format for sorting
  const getTimeInMinutes = (hour: number, minute: number, isAM: boolean) => {
    let totalMinutes = hour * 60 + minute;
    if (!isAM && hour !== 12) {
      totalMinutes += 12 * 60; // Add 12 hours for PM (except 12 PM)
    } else if (isAM && hour === 12) {
      totalMinutes = minute; // 12 AM is 00:XX
    }
    return totalMinutes;
  };

  // Get activities sorted by time
  const getSortedActivities = () => {
    return [...activities].sort((a, b) => {
      const timeA = getTimeInMinutes(a.hour, a.minute, a.period);
      const timeB = getTimeInMinutes(b.hour, b.minute, b.period);
      return timeA - timeB;
    });
  };

  const handleAddActivity = () => {
    if (!activityHour.trim() || !activityMinute.trim() || !activityName.trim() || !activityDescription.trim() || activityPeriod === null) {
      setErrorMessage("Please fill out time (including AM/PM), activity name, and description.");
      return;
    }

    const hour = parseInt(activityHour, 10);
    const minute = parseInt(activityMinute, 10);

    if (isNaN(hour) || isNaN(minute) || hour < 1 || hour > 12 || minute < 0 || minute > 59) {
      setErrorMessage("Enter a valid time (1-12 for hours, 00-59 for minutes).");
      return;
    }

    setErrorMessage("");
    
    // Add activity to the list
    const newActivity = {
      id: Date.now().toString(), // Simple ID generation
      name: activityName,
      description: activityDescription,
      hour: hour,
      minute: minute,
      period: activityPeriod,
    };
    
    setActivities(prev => [...prev, newActivity]);
    setShowAddedActivity(true);
  };


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
            My Trips
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

      

      {/*  User Trips Screen =========================================================================== */}
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
          showAddedActivity ? (
            // activity added confirmation page
            <View style={{ width: "100%" }}>
              <View style={{backgroundColor:"#0e1e38", padding: 20, borderRadius: 15, width: "100%", borderColor: "#96a0ad", borderWidth: 0.75, marginBottom: 20, justifyContent:"flex-start", alignItems:"flex-start"}}>
                  <Text style={{ color: WHITE_TEXT_COLOR, fontSize: 22, fontWeight: "800" }}>
                  {itinName}
                  </Text>
              
                  <Text style={{ color: WHITE_TEXT_COLOR, fontSize: 15, fontWeight: "500" }}>
                  Plan your day from midght to midnight!
                  </Text>
              </View>

              <View style={{backgroundColor:"#0e1e38", padding: 20, borderRadius: 15, width: "100%", borderColor: "#96a0ad", borderWidth: 0.75}}>
                    
                    <View style={{ padding: 15, borderRadius: 10, marginBottom: 15 }}>
                      <Text style={{ color: WHITE_TEXT_COLOR, fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
                        {activityName}
                      </Text>
                      
                      <Text style={{ color: "#96a0ad", fontSize: 16, marginBottom: 8 }}>
                        ⏰ {getFormattedTime()}
                      </Text>
                      
                      <Text style={{ color: WHITE_TEXT_COLOR, fontSize: 14, lineHeight: 20 }}>
                        {activityDescription}
                      </Text>
                    </View>

                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
                      <TouchableOpacity
                        onPress={() => {
                          setShowAddedActivity(false);
                          setShowActivityCreation(true);
                          // Reset form fields but keep activities
                          setActivityName("");
                          setActivityDescription("");
                          setActivityHour("");
                          setActivityMinute("");
                          setActivityPeriod(null);
                          setErrorMessage("");
                        }}
                        style={{
                          backgroundColor: "#2c4eb5",
                          padding: 13,
                          paddingLeft: 30,
                          paddingRight: 30,
                          borderRadius: 5,
                        }}
                      >
                        <Text style={{ color: WHITE_TEXT_COLOR, fontSize: 15, fontWeight: "700" }}>
                          Add Another
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          setShowAddedActivity(false);
                          setShowActivityCreation(false);
                          // Reset form fields but keep activities for display
                          setActivityName("");
                          setActivityDescription("");
                          setActivityHour("");
                          setActivityMinute("");
                          setActivityPeriod(null);
                          setErrorMessage("");
                        }}
                        style={{
                          backgroundColor: "#262a2f",
                          padding: 13,
                          borderRadius: 5,
                        }}
                      >
                        <Text style={{ color: WHITE_TEXT_COLOR, fontSize: 15, fontWeight: "300" }}>
                          Done
                        </Text>
                      </TouchableOpacity>
                    </View>
              </View>
            </View>
          ) : showActivityCreation ? (
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

                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                      <TextInput
                        value={activityHour}
                        onChangeText={handleHourChange}
                        placeholder="HH"
                        placeholderTextColor="gray"
                        keyboardType="numeric"
                        maxLength={2}
                        style={{ flex: 0.7, padding: 10, backgroundColor: "#262a2f", borderRadius: 5, color: WHITE_TEXT_COLOR, marginRight: 6 }}
                      />
                      <Text style={{ color: WHITE_TEXT_COLOR, fontSize: 18, marginRight: 6 }}>: </Text>
                      <TextInput
                        value={activityMinute}
                        onChangeText={handleMinuteChange}
                        placeholder="MM"
                        placeholderTextColor="gray"
                        keyboardType="numeric"
                        maxLength={2}
                        style={{ flex: 0.7, padding: 10, backgroundColor: "#262a2f", borderRadius: 5, color: WHITE_TEXT_COLOR, marginRight: 6 }}
                      />
                      <View style={{ flex: 1, flexDirection: "row", marginRight: 6 }}>
                        <TouchableOpacity
                          onPress={() => setActivityPeriod(true)}
                          style={{
                            flex: 1,
                            padding: 10,
                            backgroundColor: activityPeriod === true ? "#2c4eb5" : "#262a2f",
                            borderRadius: 5,
                            marginRight: 3,
                            alignItems: "center",
                          }}
                        >
                          <Text style={{ color: WHITE_TEXT_COLOR, fontSize: 16, fontWeight: "500" }}>AM</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setActivityPeriod(false)}
                          style={{
                            flex: 1,
                            padding: 10,
                            backgroundColor: activityPeriod === false ? "#2c4eb5" : "#262a2f",
                            borderRadius: 5,
                            marginLeft: 3,
                            alignItems: "center",
                          }}
                        >
                          <Text style={{ color: WHITE_TEXT_COLOR, fontSize: 16, fontWeight: "500" }}>PM</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {errorMessage ? (
                      <Text style={{ color: "#ff6b6b", marginBottom: 8 }}>{errorMessage}</Text>
                    ) : null}
                    
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
                <TouchableOpacity onPress={handleAddActivity}>
                <Text style={{ color: WHITE_TEXT_COLOR, fontSize: 15, fontWeight: "700", backgroundColor: "#2c4eb5", padding: 13,paddingLeft: 108,paddingRight: 108, borderRadius: 5 }}>
                  Add
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowActivityCreation(false);
                  // Reset form fields but keep activities
                  setActivityName("");
                  setActivityDescription("");
                  setActivityHour("");
                  setActivityMinute("");
                  setActivityPeriod(null);
                  setErrorMessage("");
                }}>
                <Text style={{ color: WHITE_TEXT_COLOR, fontSize: 15, fontWeight: "300", backgroundColor: "#262a2f", padding: 13, borderRadius: 5 }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              </View>
              

              </View>
            </View>
          ) : (
            // regular third page - show activities list
            <View style={{ flex: 1, width: "100%" }}>
              <View style={{backgroundColor:"#0e1e38", padding: 20, borderRadius: 15, width: "100%", borderColor: "#96a0ad", borderWidth: 0.75, marginBottom: 20, justifyContent:"flex-start", alignItems:"flex-start"}}>
                  <Text style={{ color: WHITE_TEXT_COLOR, fontSize: 22, fontWeight: "800" }}>
                  {itinName}
                  </Text>

                  <Text style={{ color: WHITE_TEXT_COLOR, fontSize: 15, fontWeight: "500" }}>
                  Plan your day from midght to midnight!
                  </Text>
              </View>

              {/* Display sorted activities */}
              <ScrollView 
                style={{ flex: 1, width: "100%" }} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {getSortedActivities().map((activity) => (
                  <View key={activity.id} style={{
                    backgroundColor: "#0e1e38",
                    padding: 15,
                    borderRadius: 10,
                    marginBottom: 10,
                    borderColor: "#4c5158",
                    borderWidth: 0.75,
                    width: "100%"
                  }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <Text style={{ color: WHITE_TEXT_COLOR, fontSize: 18, fontWeight: "600", flex: 1 }}>
                        {activity.name}
                      </Text>
                      <Text style={{ color: "#96a0ad", fontSize: 14, fontWeight: "500" }}>
                        {activity.hour.toString().padStart(2, "0")}:{activity.minute.toString().padStart(2, "0")} {activity.period ? "AM" : "PM"}
                      </Text>
                    </View>
                    <Text style={{ color: WHITE_TEXT_COLOR, fontSize: 14, lineHeight: 20 }}>
                      {activity.description}
                    </Text>
                  </View>
                ))}
              </ScrollView>

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
                  marginTop: 10,
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
                No Trips Yet
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
                Create Trip with AI
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
                Create Trip Manually
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
              Create a New Trip
            </Text>
            
            <TextInput
              value={itinName}
              //onChangeText={(text) => setItinName(text)}
              onChangeText={setItinName}
              placeholder="Enter trip name..."
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
                Save Trip
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