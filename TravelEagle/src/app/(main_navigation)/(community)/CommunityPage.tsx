import { useMemo, useState } from "react";
import {Image,Modal, ScrollView,StyleSheet,Text,TouchableOpacity,View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import {
  BACKGROUND_COLOR,
  ORANGE_COLOR,
  SECONDARY_BACKGROUND_COLOR,
  WHITE_TEXT_COLOR,
} from "../../constants/colors";

type EventItem = { //contains properties of an event
  id: string;
  title: string;
  category: string;
  date: string;
  location: string;
  attending: string;
  description: string;
  image?: any;
};

//hard coded filters
const categories = ["All", "Festival", "Carnival", "Sports", "Holiday"];

//example event
const events: EventItem[] = [
  {
    id: "1",
    title: "NYIT Movie Night",
    category: "Holiday",
    date: "July 1st, 2026",
    location: "Central Park, New York",
    attending: "280 attending",
    description:
      "Join us for a movie night!",
    image: { uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyma3eKhr2aLKUgxDTlgMhYYJw3N1O9RRfRg&s" },
  },
 
];

export default function CommunityPage() {
  const [selectedCategory, setSelectedCategory] = useState("All"); //sets the visibility of a category
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null); //sets the visiblity of an event card

  const filteredEvents = useMemo(() => {
    if (selectedCategory === "All") return events; //if All is selected, show all the events
    return events.filter((event) => event.category === selectedCategory); //otherwise, filter based on a specific category
  }, [selectedCategory]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <View style={styles.headerRow}>
          <Feather name="users" size={20} color={WHITE_TEXT_COLOR} />
          <Text style={styles.headerTitle}>Community Events</Text>
        </View>

        <View style={styles.categoryBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {categories.map((category) => {
              const active = category === selectedCategory;
              return (
                <TouchableOpacity
                  key={category}
                  style={[styles.categoryPill, active && styles.categoryPillActive]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          {filteredEvents.map((event) => (
            <TouchableOpacity key={event.id} style={styles.card} onPress={() => setSelectedEvent(event)}>
              {event.image ? <Image source={event.image} style={styles.cardImage} /> : null}

              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{event.title}</Text>

                <View style={styles.metaRow}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{event.category}</Text>
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

                <View style={styles.infoRow}>
                  <Feather name="users" size={14} color="#9DB4D8" />
                  <Text style={styles.infoText}>{event.attending}</Text>
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

              {selectedEvent.image ? (
                <Image source={selectedEvent.image} style={styles.modalImage} />
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

                <View style={styles.infoRow}>
                  <Feather name="users" size={15} color={ORANGE_COLOR} />
                  <Text style={styles.modalInfoText}>{selectedEvent.attending}</Text>
                </View>

                <Text style={styles.aboutTitle}>About this Event</Text>
                <Text style={styles.aboutText}>{selectedEvent.description}</Text>

                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.primaryButton}>
                    <Text style={styles.primaryButtonText}>View Location</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>Add to Itinerary</Text>
                  </TouchableOpacity>
                </View>
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
  categoryRow: {
    gap: 8,
    paddingBottom: 4,
    alignItems: "center",
  },
  categoryBar: {
    minHeight: 44,
    justifyContent: "center",
    marginBottom: 8,
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
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#3858D6",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: WHITE_TEXT_COLOR,
    fontWeight: "700",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#17365f",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2c4b77",
  },
  secondaryButtonText: {
    color: WHITE_TEXT_COLOR,
    fontWeight: "700",
  },
});
