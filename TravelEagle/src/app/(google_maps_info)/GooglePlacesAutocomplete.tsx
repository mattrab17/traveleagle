import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Alert,
} from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import {goToSelectedPlace,} from "../../../controllers/mapController";

export default function GooglePlacesInput({mapRef, setSelectedPlace}) {
  return (
      <View style={styles.container}>
        <GooglePlacesAutocomplete
          placeholder="Search for a place"
          onPress={(data, details) => {
            if (details) {
              goToSelectedPlace(mapRef, details, setSelectedPlace);
            }
            /*Remove logs & alert*/
            console.log("Selected place:", data);
            console.log("Place details:", details);
            Alert.alert("Place Selected", data.description);
          }}

          query={{
            key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
            language: "en",
          }}
          fetchDetails={true}
          styles={{
            textInputContainer: {
              backgroundColor: "transparent",
              borderTopWidth: 0,
              borderBottomWidth: 0,
            },
            /*Move TexInput into styles later or Remove it entirely */
            textInput: {
              marginLeft: 0,
              marginRight: 0,
              height: 50,
              color: "#5d5d5d",
              fontSize: 16,
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 8,
              paddingHorizontal: 12,
            },
            predefinedPlacesDescription: {
              color: "#1faadb",
            },
          }}
          debounce={200}
        />
      </View>
  );
}


/* Add styles to a diff file and import late */
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    flex: 1,
    backgroundColor: "#f5f5f5",
    top:10,
    left:16,
    right:16
    
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  resultSection: {
    marginTop: 24,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultBox: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginTop: 8,
    marginBottom: 4,
  },
  resultText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  footer: {
    marginTop: 16,
    marginBottom: 32,
    padding: 12,
    backgroundColor: "#fff3cd",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffc107",
  },
  footerText: {
    fontSize: 12,
    color: "#856404",
    textAlign: "center",
  },
});
