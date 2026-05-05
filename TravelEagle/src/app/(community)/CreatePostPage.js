import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { View, Text, TextInput, Pressable, Alert, Switch, StyleSheet, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import {
  BACKGROUND_COLOR,
  ORANGE_COLOR,
  SECONDARY_BACKGROUND_COLOR,
  WHITE_TEXT_COLOR,
} from "../constants/colors";

import useLocation from "@/LocationServices/liveLocation";

export default function UserPostsPage() {
  const router = useRouter();
  // Form state for each input field.
  const [userId, setUserId] = useState("")//stores userId so can see in database which user posted
  const [placeName, setPlaceName] = useState("")//stores place name user creates
  const [address, setAddress] = useState("")//stores address either placed by user or by reverse geolocation
  const [description, setDescription] = useState("")
  const [postLat, setPostLat] = useState("")//stores latitude from autocomplete/current location
  const [postLong, setPostLong] = useState("")//stores longitude from autocomplete/current location
  const [category, setCategory] = useState("")
  const [imageUrl, setImageUrl] = useState("")

  //if user chooses to use currentlocation, will autofill address, PostLat and PostLong sections 
  const [useCurrentLocation, setUseCurrentLocation] = useState(false)

  const { latitude, longitude, errorMsg, address: currentAddress } = useLocation()

  // Load the signed-in user's ID so the post can be linked to that user.
  const getUser = async () => {
    try {
      //gets the users info
      const {data: {user}} = await supabase.auth.getUser()
      //if a user is logged in, it stores their id
      if (user) {setUserId(user.id)} 
    } catch (error) {
      console.log(error)
      setUserId("")
    }
  }

  // Validate the form, resolve coordinates, then insert a post into Supabase.
  // This ensures each post can later be opened on the map from Community.
  const createPost = async () => {
    //place must have a name before being posted
    if (placeName.trim() === "") {
      Alert.alert("Please enter the location's name");
      return;
    }
    if (address.trim() === "") {
      Alert.alert("Please enter address, you may use your current location if needed");
      return;
    }
    /*coordinates start out as an empty string
    when doing the GET should look at coords first then address*/
    let finalLat = postLat;
    let finalLong = postLong;
    //if user choose to use current location but location fails
    if (useCurrentLocation) {
      if (latitude == null || longitude == null) {
        Alert.alert("Could not fetch user location");
        return;
      }

      finalLat = latitude
      finalLong = longitude
    }

    // Fallback: if autocomplete coords are missing, use live device coords when available.
    if (
      (finalLat === "" || finalLat == null || Number.isNaN(parseFloat(finalLat))) &&
      latitude != null
    ) {
      finalLat = latitude;
    }
    if (
      (finalLong === "" || finalLong == null || Number.isNaN(parseFloat(finalLong))) &&
      longitude != null
    ) {
      finalLong = longitude;
    }

    // Coordinates are required so Community can open the post on the map.
    if (finalLat === "" || finalLong === "" || finalLat == null || finalLong == null) {
      Alert.alert("Location missing", "Please enable 'Use current location' so your post can be viewed on the map.");
      return;
    }

    const { data, error } = await supabase
      .from("user_posts")
       //insets a row into the supabase table
      .insert([
        {
          place_name: placeName,
          address: address,
          description: description || null,
          post_lat: parseFloat(finalLat) ||null, //parse ensures that the coords are numbers
          post_long: parseFloat(finalLong) || null,
          created_by: userId,
          image_url: imageUrl || null,
          category: category || null,
        },
      ]).select()//returns row that was selected
    
    if (error) {
      console.log(error);
      //if there is an error, it will tell the user to recheck post info
      Alert.alert("Failed to creaate post, reassess post details");
    } else {
      Alert.alert("Post created");
      //once post is created, text boxes are reset
      setPlaceName("");
      setAddress("");
      setDescription("");
      setPostLat("");
      setPostLong("");
      setImageUrl("");
      setCategory("");
      setUseCurrentLocation(false);
      //close create post screen after successful submit
      router.back();
    }
  };
  // Run once when this screen opens.
  useEffect(() => {
    getUser();
  }, []);
  // If user turns on "use current location", auto-fill the address field.
  useEffect(() => {
    if (useCurrentLocation && currentAddress) {
      setAddress(currentAddress);
    }
  }, [useCurrentLocation, currentAddress]);
 return (
  <SafeAreaView style={styles.safeArea}>
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Create a Post</Text>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Text style={styles.closeButtonText}>X</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.fieldLabel}>Place Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Place name"
          placeholderTextColor="#7D97BC"
          value={placeName}
          onChangeText={setPlaceName}
        />

        <Text style={[styles.fieldLabel, { marginTop: 10 }]}>Address (Google Autocomplete)</Text>
        <View style={styles.autocompleteWrapper}>
          <GooglePlacesAutocomplete
            placeholder="Search for an address"
            minLength={2}
            fetchDetails={true}
            keyboardShouldPersistTaps="handled"
            listViewDisplayed="auto"
            enablePoweredByContainer={false}
            debounce={200}
            onFail={(error) => {
              console.warn("Google autocomplete failed:", error);
            }}
            onPress={(data, details = null) => {
              //save selected full address text
              setAddress(data.description || "");
              //save selected place coordinates so post can be opened on map
              const selectedLat = details?.geometry?.location?.lat;
              const selectedLng = details?.geometry?.location?.lng;
              if (selectedLat != null) setPostLat(String(selectedLat));
              if (selectedLng != null) setPostLong(String(selectedLng));
            }}
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
            textInputProps={{
              value: address,
              onChangeText: setAddress,
              placeholderTextColor: "#7D97BC",
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

        <Text style={[styles.fieldLabel, { marginTop: 10 }]}>Description</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Write a short description"
          placeholderTextColor="#7D97BC"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <View style={styles.locationRow}>
          <Text style={styles.fieldLabel}>Use current location</Text>
          <Switch
            value={useCurrentLocation}
            onValueChange={setUseCurrentLocation}
            trackColor={{ false: "#355782", true: "#2f57d0" }}
            thumbColor={useCurrentLocation ? ORANGE_COLOR : "#d9e2f2"}
          />
        </View>

        {useCurrentLocation && (
          <View style={styles.locationInfoBox}>
            <Text style={styles.locationInfoText}>
              Latitude: {latitude != null ? latitude : "Loading..."}
            </Text>
            <Text style={styles.locationInfoText}>
              Longitude: {longitude != null ? longitude : "Loading..."}
            </Text>
            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
          </View>
        )}

        <Text style={[styles.fieldLabel, { marginTop: 10 }]}>Image URL</Text>
        <TextInput
          style={styles.input}
          placeholder="https://example.com/image.jpg"
          placeholderTextColor="#7D97BC"
          value={imageUrl}
          onChangeText={setImageUrl}
        />

        <Text style={[styles.fieldLabel, { marginTop: 10 }]}>Category</Text>
        <TextInput
          style={styles.input}
          placeholder="Coffee, Bars, Restaurants..."
          placeholderTextColor="#7D97BC"
          value={category}
          onChangeText={setCategory}
        />

        <Pressable style={styles.submitButton} onPress={createPost}>
          <Text style={styles.submitButtonText}>Create Post</Text>
        </Pressable>
      </View>
    </ScrollView>
  </SafeAreaView>
)}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  page: {
    flex: 1,
    backgroundColor: SECONDARY_BACKGROUND_COLOR,
    overflow: "visible",
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 20,
    overflow: "visible",
  },
  headerTitle: {
    color: WHITE_TEXT_COLOR,
    fontSize: 30,
    fontWeight: "700",
  },
  headerRow: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#1f3f6b",
    borderWidth: 1,
    borderColor: "#2a4d7e",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    color: WHITE_TEXT_COLOR,
    fontSize: 14,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#0f2c58",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1d4174",
    padding: 14,
    overflow: "visible",
    zIndex: 1,
    elevation: 1,
  },
  fieldLabel: {
    color: "#9DB4D8",
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#1f3f6b",
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#2a4d7e",
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: WHITE_TEXT_COLOR,
    fontSize: 15,
  },
  autocompleteWrapper: {
    position: "relative",
    zIndex: 5000,
    elevation: 5000,
    marginBottom: 8,
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
    backgroundColor: "#1f3f6b",
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#2a4d7e",
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: WHITE_TEXT_COLOR,
    fontSize: 15,
    height: 46,
    marginTop: 0,
    marginBottom: 0,
  },
  autocompleteList: {
    position: "absolute",
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    zIndex: 6000,
    elevation: 6000,
    maxHeight: 220,
  },
  autocompleteRow: {
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  autocompleteSeparator: {
    height: 1,
    backgroundColor: "#e6e6e6",
  },
  multilineInput: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  locationRow: {
    marginTop: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationInfoBox: {
    backgroundColor: "#143861",
    borderWidth: 1,
    borderColor: "#2a4d7e",
    borderRadius: 9,
    padding: 10,
  },
  locationInfoText: {
    color: WHITE_TEXT_COLOR,
    fontSize: 14,
    marginBottom: 2,
  },
  errorText: {
    color: "#ff8e8e",
    marginTop: 4,
  },
  submitButton: {
    marginTop: 16,
    backgroundColor: "#2f57d0",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: WHITE_TEXT_COLOR,
    fontWeight: "700",
    fontSize: 15,
  },
});
