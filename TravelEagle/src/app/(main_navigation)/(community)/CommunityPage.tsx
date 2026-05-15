import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { supabase } from "@/lib/supabase";
import { FontAwesome } from '@expo/vector-icons';
import {
  BACKGROUND_COLOR,
  ORANGE_COLOR,
  SECONDARY_BACKGROUND_COLOR,
  WHITE_TEXT_COLOR,
} from "../../constants/colors";

// Unified model for both source types shown in Community:
// 1) TravelEagle events from CommunityEvents
// 2) User-created posts from user_posts
type EventItem = {
  id: string;
  title: string;
  category: string;
  date: string;
  location: string;
  description: string;
  lat?: number | null;
  lng?: number | null;
  imageUri?: string | null;
  createdBy?: string | null;
  source: "TravelEagle" | "Users";
};

type RatingStats = {
  average: number;
  count: number;
};

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export default function CommunityPage() {
  const router = useRouter();
  // Top-level source filters: show all content, only TravelEagle events, or only user posts.
  const sourceFilters: ("All" | "TravelEagle" | "Users")[] = ["All", "TravelEagle", "Users"];
  const [selectedSource, setSelectedSource] = useState<"All" | "TravelEagle" | "Users">("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [posts, setPosts] = useState<EventItem[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [selectedUserRating, setSelectedUserRating] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Convert a user_posts row into the UI shape used by this screen.
  const mapUserPostToEventItem = (post: any): EventItem => ({
    id: String(post.id ?? post.post_id ?? Math.random()),
    title: post.place_name || "Untitled Post",
    category: post.category || "Uncategorized",
    date: post.created_at? new Date(post.created_at).toLocaleDateString(): "Unknown date",
    location: post.address || "No address provided",
    description: post.description || "No description provided.",
    lat: typeof post.post_lat === "number" ? post.post_lat : null,
    lng: typeof post.post_long === "number" ? post.post_long : null,
    imageUri: post.image_url || null,
    createdBy: post.created_by || null,
    source: "Users",
  });

  // Convert a CommunityEvents row into the same UI shape.
  const mapCommunityEventToEventItem = (event: any): EventItem => ({
    id: String(event.id ?? event.event_id ?? Math.random()),
    title: event.event_name || "Untitled Event",
    category: event.event_category || "Uncategorized",
    date: event.event_date ? new Date(event.event_date).toLocaleDateString(): "Unknown date",
    location: event.event_address || "No address provided",
    description: event.event_description || "No description provided.",
    lat: typeof event.event_lat === "number" ? event.event_lat : null,
    lng: typeof event.event_lng === "number" ? event.event_lng : null,
    imageUri: event.event_image_url || null,
    createdBy: event.created_by || null,
    source: "TravelEagle",
  });

  // Load both data sources from Supabase and combine them into one list for rendering.
  // We keep a shared shape to simplify filtering and card rendering.
  const loadPosts = useCallback(async () => {
    setIsLoadingPosts(true);

    // Load user posts and community events
    const [userPostsResult, communityEventsResult] = await Promise.all([
      supabase
        .from("user_posts")
        .select("*")
        .order("created_at", { ascending: false }),

      supabase
        .from("CommunityEvents")
        .select("*")
        .order("event_date", { ascending: false }),
    ]);
    setIsLoadingPosts(false);
    if (userPostsResult.error || communityEventsResult.error) {
      console.error("Failed to load community content:", {
        userPostsError: userPostsResult.error,
        communityEventsError: communityEventsResult.error,
      });
    }

    const normalizedUserPosts: EventItem[] = (userPostsResult.data || []).map(mapUserPostToEventItem);
    const normalizedEvents: EventItem[] = (communityEventsResult.data || []).map(mapCommunityEventToEventItem);
  
    setPosts([...normalizedEvents, ...normalizedUserPosts]);
  }, []);

  const loadCurrentUser = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setCurrentUserId(user?.id ?? null);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCurrentUser();
      loadPosts();
    }, [loadCurrentUser, loadPosts])
  );

  const deleteEvent = async (eventId: string) => {
    const { error } = await supabase
      .from("CommunityEvents")
      .delete()
      .or(`id.eq.${eventId},event_id.eq.${eventId}`);

    if (error) {
      console.error("Failed to delete event:", error);
      Alert.alert("Error", "Could not delete this event.");
      return;
    }

    Alert.alert("Deleted", "Your event has been deleted.");
    setSelectedEvent(null);
    loadPosts();
  };

  // Step 1: Filter content by source (All / TravelEagle / Users).
  const sourceScopedPosts = useMemo(() => {
    if (selectedSource === "All") return posts;
    return posts.filter((post) => post.source === selectedSource);
  }, [posts, selectedSource]);

  const getPostRatingStats = async (postId: string): Promise<RatingStats> => {
    if (!isUuid(postId)) {
      return { average: 0, count: 0 };
    }

    const { data, error } = await supabase
      .from("ratings")
      .select("rating")
      .eq("post_id", postId);

    if (error) {
      console.error("Error loading ratings:", error);
      return { average: 0, count: 0 };
    }

    if (!data || data.length === 0) {
      return { average: 0, count: 0 };
    }

    const total = data.reduce((sum, row) => sum + Number(row.rating), 0);
    const average = total / data.length;

    return { average, count: data.length };
  };

  // Load the average rating and user's rating for the selected post
  const loadPostRating = async (postId: string) => {
    const stats = await getPostRatingStats(postId);
    setAverageRating(stats.average);
    setRatingCount(stats.count);
  };

  const submitRating = async (rating: number) => {
    if (!selectedEvent) return;
    if (!isUuid(selectedEvent.id)) {
      Alert.alert("Rating unavailable", "This item cannot be rated yet.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id

     if (selectedEvent.createdBy === user?.id) {
  Alert.alert("You cannot rate your own post.");
  return;
}

        // Check if user is within appropriate radius of the post location before allowing rating
    const withinRadius =
  Math.abs(latitude - selectedEvent.lat) <= 0.015 &&
  Math.abs(longitude - selectedEvent.lng) <= 0.015;

if (!withinRadius) {
  Alert.alert("Too far away", "You must be close to the post in order to rate it.");
  return;
}
    
    const {error} = await supabase.from("ratings").upsert(
  [
    {
      post_id: selectedEvent.id,
      user_id: userId,
      rating: rating,
    },
  ],
  {
    onConflict: "user_id,post_id",
  }
);
    if (error) {
      console.error("Error submitting rating:", error);
      return;
    }

    setSelectedUserRating(rating);
    loadPostRating(selectedEvent.id);
  };
  
  // Step 2: Build category pills from the currently visible source data.
  const categories = useMemo(() => {
    const dynamicCategories = Array.from(new Set(sourceScopedPosts.map((post) => post.category).filter(Boolean)));
    return ["All", ...dynamicCategories];
  }, [sourceScopedPosts]);

  // Step 3: Filter by category inside the selected source.
  const displayedPosts = useMemo(() => {
    if (selectedCategory === "All") return sourceScopedPosts;
    return sourceScopedPosts.filter((event) => event.category === selectedCategory);
  }, [selectedCategory, sourceScopedPosts]);

  const onSourceChange = (source: "All" | "TravelEagle" | "Users") => {
    setSelectedSource(source);
    setSelectedCategory("All");
  };

  // Send selected event coordinates to the interactive map screen.
  // HomeScreen reads these params and centers a marker on that location.
  const openEventOnMap = async (event: EventItem) => {
    if (event.lat == null || event.lng == null) return;
    const stats = await getPostRatingStats(event.id);
    setSelectedEvent(null);
    router.push({
      pathname: "/(main_navigation)/(interactive_map)/HomeScreen",
      params: {
        name: event.title,
        lat: String(event.lat),
        lng: String(event.lng),
        description: event.description,
        address: event.location,
        imageUrl: event.imageUri || "",
        rating: String(stats.average),
        reviewCount: String(stats.count),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <View style={styles.headerRow}>
          <Feather name="users" size={20} color={WHITE_TEXT_COLOR} />
          <Text style={styles.headerTitle}>Community Posts</Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.createActionButton}
            onPress={() => router.push("/(main_navigation)/(community)/CreatePostPage")}
          >
            <Feather name="plus-circle" size={16} color={WHITE_TEXT_COLOR} />
            <Text style={styles.createActionButtonText}>Create Post</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.createActionButton}
            onPress={() => router.push("/(main_navigation)/(community)/CreateEvent")}
          >
            <Feather name="calendar" size={16} color={WHITE_TEXT_COLOR} />
            <Text style={styles.createActionButtonText}>Create Event</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Post Filters:</Text>
          <View style={styles.categoryBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
              {sourceFilters.map((source) => {
                const active = source === selectedSource;
                return (
                  <TouchableOpacity
                    key={source}
                    style={[styles.categoryPill, active && styles.categoryPillActive]}
                    onPress={() => onSourceChange(source)}
                  >
                    <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{source}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Event Filters:</Text>
          <View style={styles.categoryBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
              {categories.map((category) => {
                const active = category === selectedCategory;
                return (
                  <TouchableOpacity
                    key={category}
                    style={[styles.categoryPill, active && styles.categoryPillActive]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{category}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          {isLoadingPosts ? (
            <ActivityIndicator color={WHITE_TEXT_COLOR} style={{ marginTop: 30 }} />
          ) : null}

          {!isLoadingPosts && displayedPosts.length === 0 ? (
            <Text style={styles.emptyText}>No posts found for this category.</Text>
          ) : null}

          {displayedPosts.map((event) => (
            <TouchableOpacity
              key={`${event.source}-${event.id}`}
              style={styles.card}
              onPress={async () => {
                setSelectedEvent(event);
                setSelectedUserRating(0);
                await loadPostRating(event.id);
              }}
            >
              {event.imageUri ? <Image source={{ uri: event.imageUri }} style={styles.cardImage} /> : null}

              <View style={styles.cardBody}>
                <View style={styles.itemTypeTag}>
                  <Text style={styles.itemTypeTagText}>
                    {event.source === "Users" ? "Post" : "Event"}
                  </Text>
                </View>

                <Text style={styles.cardTitle}>{event.title}</Text>

                <View style={styles.metaRow}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{event.category}</Text>
                  </View>
                  <View style={styles.sourceTag}>
                    <Text style={styles.sourceTagText}>{event.source}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Feather name="calendar" size={14} color="#9DB4D8" />
                  <Text style={styles.infoText}>{event.date}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Feather name="map-pin" size={14} color="#9DB4D8" />
                  <Text style={styles.infoText}>{event.location}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Modal visible={!!selectedEvent} transparent animationType="fade" onRequestClose={() => setSelectedEvent(null)}>
        <View style={styles.modalOverlay}>
          {selectedEvent && (
            <View style={styles.modalCard}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedEvent(null)}>
                <Feather name="x" size={18} color={WHITE_TEXT_COLOR} />
              </TouchableOpacity>

              {selectedEvent.imageUri ? (
                <Image source={{ uri: selectedEvent.imageUri }} style={styles.modalImage} />
              ) : null}

              <View style={styles.modalBody}>
                <Text style={styles.modalTitle}>{selectedEvent.title}</Text>

                <View style={styles.tag}>
                  <Text style={styles.tagText}>{selectedEvent.category}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Feather name="calendar" size={15} color={ORANGE_COLOR} />
                  <Text style={styles.modalInfoText}>{selectedEvent.date}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Feather name="map-pin" size={15} color={ORANGE_COLOR} />
                  <Text style={styles.modalInfoText}>{selectedEvent.location}</Text>
                </View>

                <Text style={styles.aboutTitle}>About this Post</Text>
                <Text style={styles.aboutText}>{selectedEvent.description}</Text>

                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingTitle}>
                    Rating: {averageRating.toFixed(1)},   {ratingCount} total rating(s)
                  </Text>

                  <View style={styles.starRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => submitRating(star)}
                      >
                        <FontAwesome
                        name={selectedUserRating >= star ? "star" : "star-o"}
                        size={32}
                        color={selectedUserRating >= star ? "#FFD700" : "#6B7280"}
                        style={{ marginRight: 6 }}
                      />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                {selectedEvent.lat != null && selectedEvent.lng != null ? (
                  <TouchableOpacity style={styles.primaryButton} onPress={() => openEventOnMap(selectedEvent)}>
                    <Text style={styles.primaryButtonText}>View Location</Text>
                  </TouchableOpacity>
                ) : null}

                {selectedEvent.source === "TravelEagle" && selectedEvent.createdBy === currentUserId ? (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() =>
                      Alert.alert("Delete Event", "Delete this event permanently?", [
                        { text: "Cancel", style: "cancel" },
                        { text: "Delete", style: "destructive", onPress: () => deleteEvent(selectedEvent.id) },
                      ])
                    }
                  >
                    <Text style={styles.deleteButtonText}>Delete My Event</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          )}
        </View>
      </Modal>
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
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  headerTitle: {
    color: WHITE_TEXT_COLOR,
    fontSize: 29,
    fontWeight: "700",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  createActionButton: {
    backgroundColor: "#2f57d0",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: 8,
  },
  createActionButtonText: {
    color: WHITE_TEXT_COLOR,
    fontSize: 15,
    fontWeight: "700",
  },
  categoryRow: {
    gap: 8,
    paddingBottom: 4,
    alignItems: "center",
  },
  categoryBar: {
    flex: 1,
    minHeight: 44,
    justifyContent: "center",
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  filterLabel: {
    color: "#B9CAE4",
    fontSize: 12,
    fontWeight: "700",
    minWidth: 86,
  },
  categoryPill: {
    minHeight: 30,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 4,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#355782",
    backgroundColor: "transparent",
  },
  categoryPillActive: {
    borderColor: ORANGE_COLOR,
    backgroundColor: "rgba(255, 184, 69, 0.15)",
  },
  categoryText: {
    color: WHITE_TEXT_COLOR,
    fontWeight: "600",
    fontSize: 13,
    textAlignVertical: "center",
  },
  categoryTextActive: {
    color: ORANGE_COLOR,
  },
  card: {
    backgroundColor: "#0f2c58",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1d4174",
    marginBottom: 12,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 170,
  },
  cardBody: {
    padding: 12,
  },
  cardTitle: {
    color: WHITE_TEXT_COLOR,
    fontWeight: "700",
    fontSize: 25,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  tag: {
    alignSelf: "flex-start",
    backgroundColor: "#1f4a80",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 6,
  },
  tagText: {
    color: ORANGE_COLOR,
    fontSize: 11,
    fontWeight: "700",
  },
  sourceTag: {
    alignSelf: "flex-start",
    backgroundColor: "#18365d",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 6,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: "#2b517f",
  },
  sourceTagText: {
    color: "#B9CAE4",
    fontSize: 11,
    fontWeight: "700",
  },
  itemTypeTag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 184, 69, 0.15)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: ORANGE_COLOR,
    marginBottom: 8,
  },
  itemTypeTagText: {
    color: ORANGE_COLOR,
    fontSize: 11,
    fontWeight: "800",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  infoText: {
    color: "#9DB4D8",
    fontSize: 15,
  },
  emptyText: {
    color: "#9DB4D8",
    textAlign: "center",
    marginTop: 30,
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  modalCard: {
    backgroundColor: "#0f2c58",
    borderRadius: 16,
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    zIndex: 10,
    right: 12,
    top: 12,
    backgroundColor: "rgba(0,0,0,0.45)",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: "100%",
    height: 200,
  },
  modalBody: {
    padding: 14,
  },
  modalTitle: {
    color: WHITE_TEXT_COLOR,
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 8,
  },
  modalInfoText: {
    color: WHITE_TEXT_COLOR,
    fontSize: 16,
  },
  aboutTitle: {
    marginTop: 6,
    color: WHITE_TEXT_COLOR,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  aboutText: {
    color: "#B9CAE4",
    fontSize: 16,
    lineHeight: 22,
  },
    ratingContainer: {
    marginTop: 14,
    marginBottom: 6,
  },
  ratingTitle: {
    color: WHITE_TEXT_COLOR,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  starRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  primaryButton: {
    marginTop: 14,
    backgroundColor: "#3858D6",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: WHITE_TEXT_COLOR,
    fontWeight: "700",
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: "#7D1D25",
    borderWidth: 1,
    borderColor: "#C83A48",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#FFD8DD",
    fontWeight: "700",
  },
});

