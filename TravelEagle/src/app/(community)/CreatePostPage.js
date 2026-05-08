import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
} from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import Feather from "@expo/vector-icons/Feather";
import { useNavigation, useRouter } from "expo-router";

import { supabase } from "@/lib/supabase";
import useLocation from "@/LocationServices/liveLocation";
import CameraRoll from "@/cameraRoll/PhotoLibraryAccess";

export default function UserPostsPage() {
  const router = useRouter();
  const navigation = useNavigation();
  const [userId, setUserId] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [postLat, setPostLat] = useState("");
  const [postLong, setPostLong] = useState("");
  const [category, setCategory] = useState([]);
  const [imageUrl, setImageUrl] = useState("");

  const [useCurrentLocation, setUseCurrentLocation] = useState(true);

  const {
    latitude,
    longitude,
    address: currentAddress,
  } = useLocation();

  async function getUser() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
      }
    } catch (error) {
      console.log(error);
      setUserId("");
    }
  }

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (useCurrentLocation && currentAddress) {
      setAddress(currentAddress);
    }
  }, [useCurrentLocation, currentAddress]);

  function toggleCategory(selectedCategory) {
    if (category.includes(selectedCategory)) {
      setCategory(category.filter((item) => item !== selectedCategory));
    } else {
      setCategory([...category, selectedCategory]);
    }
  }

  const postFilterOptions = [
    "Restaurants",
    "General Attractions",
    "Coffee",
    "Bars",
  ];

  async function createPost() {
    if (placeName.trim() === "") {
      Alert.alert("Please enter the location's name");
      return;
    }

    if (address.trim() === "") {
      Alert.alert("Please enter an address or use your current location");
      return;
    }

    let finalLat = postLat;
    let finalLong = postLong;

    if (useCurrentLocation) {
      if (latitude == null || longitude == null) {
        Alert.alert("Could not fetch user location");
        return;
      }

      finalLat = latitude;
      finalLong = longitude;
    }

    const { error } = await supabase.from("user_posts").insert([
      {
        place_name: placeName,
        address: address,
        description: description || null,
        post_lat: parseFloat(finalLat) || null,
        post_long: parseFloat(finalLong) || null,
        created_by: userId,
        image_url: imageUrl || null,
        category: category.length > 0 ? category : null,
      },
    ]);

    if (error) {
      console.log(error);
      Alert.alert("Failed to create post", "Please reassess the post details.");
      return;
    }

    Alert.alert("Success", "Post created.");

    setPlaceName("");
    setAddress("");
    setDescription("");
    setPostLat("");
    setPostLong("");
    setImageUrl("");
    setCategory([]);
    setUseCurrentLocation(true);
  }

  function handleBack() {
    if (navigation.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(main_navigation)/(community)/CommunityPage");
  }

  return (
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <Pressable
            style={styles.backButton}
            onPress={handleBack}
          >
            <Feather name="arrow-left" size={18} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Create a Post</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Place Name</Text>

          <TextInput
            style={styles.input}
            placeholder="Place name"
            placeholderTextColor="#9DB4D8"
            value={placeName}
            onChangeText={setPlaceName}
          />

          <Text style={styles.label}>Address</Text>

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

                setAddress(selectedAddress);
                if (selectedLat != null) setPostLat(String(selectedLat));
                if (selectedLng != null) setPostLong(String(selectedLng));
                setUseCurrentLocation(false);
              }}
              textInputProps={{
                value: address,
                onChangeText: setAddress,
                placeholderTextColor: "#9DB4D8",
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

          <Text style={styles.label}>Description</Text>

          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Description"
            placeholderTextColor="#9DB4D8"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={styles.label}>Add Image</Text>

          <CameraRoll onImageSelected={setImageUrl} />

          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.postImage} />
          ) : null}

          <Text style={styles.label}>Categories</Text>

          <View style={styles.filtersWrap}>
            {postFilterOptions.map((option) => {
              const selected = category.includes(option);

              return (
                <Pressable
                  key={option}
                  style={[
                    styles.filterOptionBtn,
                    selected && styles.filterOptionBtnSelected,
                  ]}
                  onPress={() => toggleCategory(option)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selected && styles.filterOptionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable style={styles.createButton} onPress={createPost}>
            <Text style={styles.createButtonText}>Create Post</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#071A33",
  },
  
  page: {
    flexGrow: 1,
    backgroundColor: "#0B2344",
    paddingHorizontal: 12,
    paddingTop: 72,
    paddingBottom: 30,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "700",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
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

  card: {
    backgroundColor: "#0f2c58",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1d4174",
    padding: 14,
  },

  label: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#355782",
    backgroundColor: "#18365d",
    color: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    fontSize: 15,
  },
  autocompleteWrapper: {
    position: "relative",
    zIndex: 5000,
    elevation: 5000,
    marginBottom: 14,
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
    borderColor: "#355782",
    backgroundColor: "#18365d",
    color: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
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

  descriptionInput: {
    minHeight: 90,
    textAlignVertical: "top",
  },

  filtersWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    marginBottom: 14,
  },

  filterOptionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#1c3252",
    marginRight: 10,
    marginBottom: 10,
  },

  filterOptionBtnSelected: {
    backgroundColor: "#3858D6",
  },

  filterOptionText: {
    color: "white",
    fontSize: 14,
  },

  filterOptionTextSelected: {
    fontWeight: "700",
  },

  createButton: {
    backgroundColor: "#3858D6",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 4,
  },

  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  postImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 14,
  },
});
