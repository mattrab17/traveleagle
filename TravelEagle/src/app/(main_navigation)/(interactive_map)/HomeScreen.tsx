import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import MapView from "react-native-maps";
import { goToSearchedPlace } from "../../../../controllers/mapController";
import { BACKGROUND_COLOR } from "../../constants/colors";
import GoogleMapsView from "../../(google_maps_info)/GoogleMapsView";

type SelectedPlace = {
  name: string;
  lng: number;
  lat: number;
  description?: string;
} | null;

export default function HomeScreen() {
  const mapRef = useRef<MapView | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace>(null);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* edges property places padding at the top edge of the screen */}
      <StatusBar barStyle="light-content" />
      {/* Device status settings are set to light mode color */}

      <View style={styles.container}>
        {/* Hero Section */}
        <View style={styles.topBox}>
          {/* Explore Box */}
          <View style={styles.header}>
            <Image
              source={require("../../../../assets/images/traveleaglelogo.png")}
              style={styles.logo}
            />
            <Text style={styles.headerTitle}>Explore</Text>
          </View>

          {/* Search + Filter */}
          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <View style={styles.searchIcon}>
                <Feather name="search" size={18} color="#8F8F8F" />
              </View>
              <GooglePlacesAutocomplete
                placeholder="Search..."
                fetchDetails={true}
                onPress={(data, details) => {
                  if (details) {
                    goToSearchedPlace(mapRef, details, setSelectedPlace);
                  }
                }}
                query={{
                  key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
                  language: "en",
                }}
                styles={{
                  container: styles.autocompleteContainer,
                  textInputContainer: styles.autocompleteTextInputContainer,
                  textInput: styles.autocompleteTextInput,
                  listView: styles.autocompleteList,
                  row: styles.autocompleteRow,
                  description: styles.autocompleteDescription,
                }}
                debounce={200}
                enablePoweredByContainer={false}
              />
            </View>

            <TouchableOpacity style={styles.filterBtn}>
              <MaterialIcons name="filter-list" size={24} color="#8F8F8F" />
            </TouchableOpacity>
          </View>
        </View>

        {/* MIDDLE CONTENT AREA FOR MAP */}
        <View style={styles.contentArea}>
          {/* Google Maps component */}
          <GoogleMapsView
            mapRef={mapRef}
            selectedPlace={selectedPlace}
            setSelectedPlace={setSelectedPlace}
            showSearchInput={false}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#000C33", // MAIN BACKGROUND COLOR
  },
  container: {
    flex: 1,
  },
  topBox: {
    backgroundColor: BACKGROUND_COLOR,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 15,
    zIndex: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  logo: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c3252",
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  searchIcon: {
    marginRight: 8,
    marginTop: 1,
  },
  autocompleteContainer: {
    flex: 1,
  },
  autocompleteTextInputContainer: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 0,
    margin: 0,
  },
  autocompleteTextInput: {
    height: 44,
    color: "#FFFFFF",
    fontSize: 15,
    margin: 0,
    backgroundColor: "transparent",
    borderWidth: 0,
    paddingLeft: 0,
  },
  autocompleteList: {
    backgroundColor: "#1c3252",
    borderRadius: 10,
    marginTop: 8,
  },
  autocompleteRow: {
    backgroundColor: "#1c3252",
  },
  autocompleteDescription: {
    color: "#FFFFFF",
  },
  filterBtn: {
    marginLeft: 10,
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#1c3252",
    justifyContent: "center",
    alignItems: "center",
  },
  // MIDDLE CONTENT AREA
  contentArea: {
    flex: 0.6,
    backgroundColor: "#0A1628",
    borderColor: "#ffffff75",
    borderTopWidth: 0.17,
  },
});
