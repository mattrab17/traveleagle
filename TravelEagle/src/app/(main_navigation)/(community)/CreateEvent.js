import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "@/lib/supabase";
import useLocation from "@/LocationServices/liveLocation";
import CameraRoll from "@/cameraRoll/PhotoLibraryAccess";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

import {
  BACKGROUND_COLOR,
  ORANGE_COLOR,
  SECONDARY_BACKGROUND_COLOR,
  WHITE_TEXT_COLOR,
} from "../../constants/colors";

const categories = ["Festival", "Carnival", "Sports", "Holiday"];

export default function CreateCommunityEventPage() {
  const router = useRouter();
  const [eventName, setEventName] = useState("");
  const [eventAddress, setEventAddress] = useState("");
  const [eventLat, setEventLat] = useState("");
  const [eventLng, setEventLng] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventImageUrl, setEventImageUrl] = useState("");
  const [eventCategory, setEventCategory] = useState("Festival");
  const [numAttending, setNumAttending] = useState("");
  const [loading, setLoading] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  const { latitude, longitude, errorMsg, address: currentAddress } = useLocation();

  useEffect(() => {
    if (useCurrentLocation && currentAddress) {
      setEventAddress(currentAddress);
      if (latitude != null) setEventLat(String(latitude));
      if (longitude != null) setEventLng(String(longitude));
    }
  }, [useCurrentLocation, currentAddress, latitude, longitude]);

  const resetForm = () => {
    setEventName("");
    setEventAddress("");
    setEventLat("");
    setEventLng("");
    setEventDescription("");
    setEventDate("");
    setEventImageUrl("");
    setEventCategory("Festival");
    setNumAttending("");
    setUseCurrentLocation(false);
  };

  useFocusEffect(
    useCallback(() => {
      resetForm();
    }, [])
  );

  const createCommunityEvent = async () => {
    if (!eventName.trim() || !eventAddress || !eventDescription || !eventCategory || !eventDate.trim()) {
      Alert.alert("Missing info", "Please fill out the required fields.");
      return;
    }

    const trimmedDate = eventDate.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
      Alert.alert("Invalid date", "Use YYYY-MM-DD format (example: 2026-05-14).");
      return;
    }

    let finalLat = eventLat;
    let finalLng = eventLng;

    if (useCurrentLocation) {
      if (latitude == null || longitude == null) {
        Alert.alert("Location missing", "Could not fetch your current location yet.");
        return;
      }
      finalLat = String(latitude);
      finalLng = String(longitude);
    } else if (!finalLat || !finalLng) {
      Alert.alert("Location missing", "Please choose an address from autocomplete or use current location.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("CommunityEvents").insert({
      event_name: eventName.trim(),
      event_address: eventAddress,
      event_lat: parseFloat(finalLat),
      event_lng: parseFloat(finalLng),
      event_description: eventDescription,
      event_date: trimmedDate,
      event_image_url: eventImageUrl || null,
      event_category: eventCategory,
      num_attending: numAttending ? Number(numAttending) : 0,
      created_by: user?.id || null,
    });

    setLoading(false);

    if (error) {
      console.error(error);
      Alert.alert("Error", "Failed to create community event.");
      return;
    }

    resetForm();
    Alert.alert("Success", "Community event created!");
    router.replace("/(main_navigation)/(community)/CommunityPage");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <FlatList
          style={styles.page}
          contentContainerStyle={styles.pageContent}
          data={[]}
          renderItem={() => null}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              <View style={styles.headerRow}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => router.replace("/(main_navigation)/(community)/CommunityPage")}
                >
                  <Feather name="arrow-left" size={18} color={WHITE_TEXT_COLOR} />
                </TouchableOpacity>
                <Feather name="plus-circle" size={22} color={WHITE_TEXT_COLOR} />
                <Text style={styles.headerTitle}>Create Event</Text>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Event name"
                placeholderTextColor="#9DB4D8"
                value={eventName}
                onChangeText={setEventName}
                returnKeyType="done"
                blurOnSubmit
                onSubmitEditing={Keyboard.dismiss}
              />

              <TouchableOpacity
                style={styles.locationToggleRow}
                onPress={() => setUseCurrentLocation((prev) => !prev)}
              >
                <Feather
                  name={useCurrentLocation ? "check-square" : "square"}
                  size={18}
                  color={ORANGE_COLOR}
                />
                <Text style={styles.locationToggleText}>Use my current location</Text>
              </TouchableOpacity>

              <View style={styles.locationBox}>
                <Text style={styles.locationTitle}>Event Location</Text>

                {useCurrentLocation ? (
                  <>
                    <Text style={styles.locationText}>
                      Address: {eventAddress || "Loading address..."}
                    </Text>
                    <Text style={styles.locationText}>
                      Latitude: {latitude != null ? latitude : "Loading..."}
                    </Text>
                    <Text style={styles.locationText}>
                      Longitude: {longitude != null ? longitude : "Loading..."}
                    </Text>
                  </>
                ) : (
                  <View style={styles.autocompleteWrapper}>
                    <GooglePlacesAutocomplete
                      placeholder="Search for an address"
                      minLength={2}
                      fetchDetails={true}
                      listViewDisplayed="auto"
                      keyboardShouldPersistTaps="handled"
                      keepResultsAfterBlur={true}
                      enablePoweredByContainer={false}
                      debounce={200}
                      query={{
                        key: (process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "").trim(),
                        language: "en",
                      }}
                      requestUrl={
                        Platform.OS === "web"
                          ? {
                              useOnPlatform: "web",
                              url: "https://maps.googleapis.com/maps/api",
                            }
                          : undefined
                      }
                      onFail={(error) => {
                        console.warn("Google autocomplete failed:", error);
                      }}
                      onPress={(data, details = null) => {
                        const selectedAddress = data?.description || details?.formatted_address || "";
                        const selectedLat = details?.geometry?.location?.lat;
                        const selectedLng = details?.geometry?.location?.lng;

                        setEventAddress(selectedAddress);
                        if (selectedLat != null) setEventLat(String(selectedLat));
                        if (selectedLng != null) setEventLng(String(selectedLng));
                      }}
                      textInputProps={{
                        value: eventAddress,
                        onChangeText: setEventAddress,
                        placeholderTextColor: "#9DB4D8",
                        returnKeyType: "done",
                        blurOnSubmit: true,
                        onSubmitEditing: Keyboard.dismiss,
                      }}
                      styles={{
                        container: styles.autocompleteContainer,
                        textInputContainer: styles.autocompleteTextInputContainer,
                        textInput: styles.autocompleteInput,
                        listView: styles.autocompleteList,
                        row: styles.autocompleteRow,
                        separator: styles.autocompleteSeparator,
                      }}
                    />
                  </View>
                )}

                {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
              </View>

              <TextInput
                style={[styles.input, styles.bigInput]}
                placeholder="Event description"
                placeholderTextColor="#9DB4D8"
                value={eventDescription}
                onChangeText={setEventDescription}
                multiline
                returnKeyType="done"
                blurOnSubmit
                onSubmitEditing={Keyboard.dismiss}
              />

              <TextInput
                style={styles.input}
                placeholder="Event date (YYYY-MM-DD)"
                placeholderTextColor="#9DB4D8"
                value={eventDate}
                onChangeText={setEventDate}
                returnKeyType="done"
                blurOnSubmit
                onSubmitEditing={Keyboard.dismiss}
              />

              <Text style={styles.label}>Add Image</Text>
              <CameraRoll onImageSelected={setEventImageUrl} />
              {eventImageUrl ? (
                <Image source={{ uri: eventImageUrl }} style={styles.eventImage} />
              ) : null}

              <TextInput
                style={styles.input}
                placeholder="Number attending"
                placeholderTextColor="#9DB4D8"
                value={numAttending}
                onChangeText={setNumAttending}
                keyboardType="numeric"
                returnKeyType="done"
                blurOnSubmit
                onSubmitEditing={Keyboard.dismiss}
              />

              <Text style={styles.label}>Category</Text>

              <View style={styles.categoryRow}>
                {categories.map((category) => {
                  const active = category === eventCategory;

                  return (
                    <TouchableOpacity
                      key={category}
                      style={[styles.categoryPill, active && styles.categoryPillActive]}
                      onPress={() => setEventCategory(category)}
                    >
                      <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={createCommunityEvent}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Creating..." : "Create Community Event"}
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  page: {
    flex: 1,
    backgroundColor: SECONDARY_BACKGROUND_COLOR,
  },
  pageContent: {
    padding: 14,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 18,
  },
  headerTitle: {
    color: WHITE_TEXT_COLOR,
    fontSize: 29,
    fontWeight: "700",
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1f3f6b",
    borderWidth: 1,
    borderColor: "#2a4d7e",
  },
  locationToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  locationToggleText: {
    color: WHITE_TEXT_COLOR,
    fontSize: 15,
    fontWeight: "700",
  },
  locationBox: {
    backgroundColor: "#0f2c58",
    borderColor: "#1d4174",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  locationTitle: {
    color: ORANGE_COLOR,
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 8,
  },
  locationText: {
    color: "#B9CAE4",
    fontSize: 14,
    marginBottom: 4,
  },
  errorText: {
    color: "red",
    marginTop: 6,
  },
  autocompleteWrapper: {
    position: "relative",
    zIndex: 5000,
    elevation: 5000,
  },
  autocompleteContainer: {
    flex: 0,
    position: "relative",
    zIndex: 5000,
  },
  autocompleteTextInputContainer: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 0,
  },
  autocompleteInput: {
    borderWidth: 1,
    borderColor: "#1d4174",
    backgroundColor: "#0f2c58",
    color: WHITE_TEXT_COLOR,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginTop: 0,
    marginBottom: 0,
  },
  autocompleteList: {
    position: "absolute",
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    maxHeight: 240,
    zIndex: 6000,
    elevation: 6000,
  },
  autocompleteRow: {
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  autocompleteSeparator: {
    height: 1,
    backgroundColor: "#E8E8E8",
  },
  input: {
    backgroundColor: "#0f2c58",
    borderColor: "#1d4174",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    color: WHITE_TEXT_COLOR,
    marginBottom: 12,
    fontSize: 16,
  },
  bigInput: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  label: {
    color: WHITE_TEXT_COLOR,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  categoryPill: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#355782",
  },
  categoryPillActive: {
    borderColor: ORANGE_COLOR,
    backgroundColor: "rgba(255, 184, 69, 0.15)",
  },
  categoryText: {
    color: WHITE_TEXT_COLOR,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: ORANGE_COLOR,
  },
  button: {
    backgroundColor: ORANGE_COLOR,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#000",
    fontWeight: "800",
    fontSize: 16,
  },
  eventImage: {
  width: "100%",
  height: 220,
  borderRadius: 12,
  marginTop: 12,
  marginBottom: 14,
},
imagePickerWrapper: {
  alignSelf: "flex-start",
  marginBottom: 14,
},
});
