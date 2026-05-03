import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { supabase } from "@/lib/supabase";
import useLocation from "@/LocationServices/liveLocation";

import {
  BACKGROUND_COLOR,
  ORANGE_COLOR,
  SECONDARY_BACKGROUND_COLOR,
  WHITE_TEXT_COLOR,
} from "../constants/colors";

const categories = ["Festival", "Carnival", "Sports", "Holiday"];

export default function CreateCommunityEventPage() {
  const [eventAddress, setEventAddress] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventImageUrl, setEventImageUrl] = useState("");
  const [eventCategory, setEventCategory] = useState("Festival");
  const [numAttending, setNumAttending] = useState("");
  const [loading, setLoading] = useState(false);

  const { latitude, longitude, errorMsg, address: currentAddress } = useLocation();

  useEffect(() => {
    if (currentAddress) {
      setEventAddress(currentAddress);
    }
  }, [currentAddress]);

  const createCommunityEvent = async () => {
    if (!eventAddress || !eventDescription || !eventCategory) {
      Alert.alert("Missing info", "Please fill out the required fields.");
      return;
    }

    if (latitude == null || longitude == null) {
      Alert.alert("Location missing", "Could not fetch your current location yet.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("CommunityEvents").insert({
      event_address: eventAddress,
      event_lat: latitude,
      event_lng: longitude,
      event_description: eventDescription,
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

    Alert.alert("Success", "Community event created!");

    setEventAddress("");
    setEventDescription("");
    setEventImageUrl("");
    setEventCategory("Festival");
    setNumAttending("");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.headerRow}>
          <Feather name="plus-circle" size={22} color={WHITE_TEXT_COLOR} />
          <Text style={styles.headerTitle}>Create Event</Text>
        </View>

        <View style={styles.locationBox}>
          <Text style={styles.locationTitle}>Using your current location</Text>

          <Text style={styles.locationText}>
            Address: {eventAddress || "Loading address..."}
          </Text>

          <Text style={styles.locationText}>
            Latitude: {latitude != null ? latitude : "Loading..."}
          </Text>

          <Text style={styles.locationText}>
            Longitude: {longitude != null ? longitude : "Loading..."}
          </Text>

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
        </View>

        <TextInput
          style={[styles.input, styles.bigInput]}
          placeholder="Event description"
          placeholderTextColor="#9DB4D8"
          value={eventDescription}
          onChangeText={setEventDescription}
          multiline
        />

        <TextInput
          style={styles.input}
          placeholder="Image URL optional"
          placeholderTextColor="#9DB4D8"
          value={eventImageUrl}
          onChangeText={setEventImageUrl}
        />

        <TextInput
          style={styles.input}
          placeholder="Number attending"
          placeholderTextColor="#9DB4D8"
          value={numAttending}
          onChangeText={setNumAttending}
          keyboardType="numeric"
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  page: {
    flexGrow: 1,
    backgroundColor: SECONDARY_BACKGROUND_COLOR,
    padding: 14,
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
});
