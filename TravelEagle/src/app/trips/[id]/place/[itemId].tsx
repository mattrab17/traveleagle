import { itineraryController } from "@/controllers/itineraryController";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BACKGROUND_COLOR,
  SECONDARY_BACKGROUND_COLOR,
  WHITE_TEXT_COLOR,
  ORANGE_COLOR,
  SEARCH_BACKGROUND_COLOR,
} from "@/src/app/constants/colors";

export default function ItineraryPlaceDetailsScreen() {
  const router = useRouter();
  const { id, itemId } = useLocalSearchParams<{ id: string; itemId: string }>();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadItem() {
      setLoading(true);
      const tripId = Number(id);
      const targetItemId = Number(itemId);

      if (!tripId || !targetItemId) {
        setItem(null);
        setLoading(false);
        return;
      }

      const { data } = await itineraryController.loadAllItems(tripId);
      const found = (data || []).find((entry: any) => entry.id === targetItemId) || null;
      setItem(found);
      setLoading(false);
    }

    loadItem();
  }, [id, itemId]);

  const placeData = item?.place?.place_data || {};

  const photoUri = useMemo(() => {
    const photoReference = placeData?.photos?.[0]?.photo_reference;
    if (!photoReference) return null;
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1000&photoreference=${photoReference}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`;
  }, [placeData]);

  const placeName = item?.place?.name || placeData?.name || "Selected Place";
  const address = item?.place?.address || placeData?.formatted_address || "Not available";
  const website = placeData?.website || "Not available";
  const openHours =
    placeData?.current_opening_hours?.weekday_text?.join("\n") ||
    placeData?.opening_hours?.weekday_text?.join("\n") ||
    "Not available";
  const crowdLevel = placeData?.crowdLevel || "Not available";
  const ratingText =
    typeof placeData?.rating === "number" ? `\u2B50 ${placeData.rating.toFixed(1)}` : "\u2B50 N/A";

  async function openWebsite(url?: string) {
    if (!url || url === "Not available") return;
    const trimmed = url.trim();
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const canOpen = await Linking.canOpenURL(withProtocol);
    if (canOpen) {
      await Linking.openURL(withProtocol);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={WHITE_TEXT_COLOR} />
        </TouchableOpacity>

        <Text style={styles.title}>Place Details</Text>

        {loading ? (
          <Text style={styles.placeholder}>Loading place information...</Text>
        ) : !item ? (
          <Text style={styles.placeholder}>Could not find this itinerary place.</Text>
        ) : (
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.placeName}>{placeName}</Text>
              <Text style={styles.rating}>{ratingText}</Text>
            </View>

            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photo} />
            ) : (
              <View style={styles.photoFallback}>
                <Text style={styles.photoFallbackText}>No image available</Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Open Hours</Text>
              <Text style={styles.infoValue}>{openHours}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Crowd Level</Text>
              <Text style={styles.infoValue}>{crowdLevel}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{address}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Website</Text>
              {website !== "Not available" ? (
                <TouchableOpacity onPress={() => openWebsite(website)}>
                  <Text style={styles.websiteLink}>{website}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.infoValue}>Not available</Text>
              )}
            </View>

            {item?.notes ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Notes</Text>
                <Text style={styles.infoValue}>{item.notes}</Text>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: SECONDARY_BACKGROUND_COLOR,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  backText: {
    color: WHITE_TEXT_COLOR,
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
  },
  title: {
    color: WHITE_TEXT_COLOR,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 16,
  },
  placeholder: {
    color: WHITE_TEXT_COLOR,
    fontSize: 15,
  },
  card: {
    backgroundColor: SECONDARY_BACKGROUND_COLOR,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ffffff20",
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  placeName: {
    color: WHITE_TEXT_COLOR,
    fontSize: 22,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  rating: {
    color: ORANGE_COLOR,
    fontWeight: "700",
    fontSize: 14,
  },
  photo: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 14,
  },
  photoFallback: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    marginBottom: 14,
    backgroundColor: SEARCH_BACKGROUND_COLOR,
    justifyContent: "center",
    alignItems: "center",
  },
  photoFallbackText: {
    color: WHITE_TEXT_COLOR,
    opacity: 0.8,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    color: "#9DB3D1",
    fontSize: 13,
    marginBottom: 4,
  },
  infoValue: {
    color: WHITE_TEXT_COLOR,
    fontSize: 15,
    lineHeight: 21,
  },
  websiteLink: {
    color: "#7FB8FF",
    textDecorationLine: "underline",
    fontSize: 15,
    lineHeight: 21,
  },
});

