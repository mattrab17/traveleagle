import React, { useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Platform,
} from "react-native";
// Added Alert since it is used in your code
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { goToSearchedPlace } from "../../../controllers/mapController";
import { Feather } from "@expo/vector-icons"; // Added for the location icon
import MapView from "react-native-maps";


//Selected Place Object Attributes
type SelectedPlace = {
  name: string; //name
  lng: number; //longitude
  lat: number; //latitude
  description?: string; //description
  rating?: number; //star rating
  address?: string; //address
  website?: string; //website
  openHours?: string; //open hours
  crowdLevel?: string; //crowd level (NOT CURRENTLY WORKING)
  photoUrl?: string; //photo of the location
  placeId?: string; //placeID
} | null;

type GooglePlacesInputProps = {
  mapRef?: React.RefObject<MapView | null>;
  setSelectedPlace?: React.Dispatch<React.SetStateAction<SelectedPlace>>;
  googlePlacesRef?: React.RefObject<any>;
  searchText?: string;
  setSearchText?: React.Dispatch<React.SetStateAction<string>> | ((text: string) => void);
};

type GooglePlacesInputTripProps = {
  onSelect: (data: any, details: any) => void;
  placeholder?: string;
};

export default function GooglePlacesInput({
  mapRef,
  setSelectedPlace,
  googlePlacesRef,
  searchText,
  setSearchText,
}: GooglePlacesInputProps) {
  const internalGooglePlacesRef = useRef<any>(null);
  const [internalSearchText, setInternalSearchText] = useState("");
  const apiKey = (process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "").trim();
  const activeGooglePlacesRef = googlePlacesRef ?? internalGooglePlacesRef;
  const activeSearchText = searchText ?? internalSearchText;
  const activeSetSearchText = setSearchText ?? setInternalSearchText;

  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        ref={activeGooglePlacesRef}
        placeholder="Search for a place"
        minLength={2}
        listViewDisplayed="auto"
        keyboardShouldPersistTaps="handled"
        keepResultsAfterBlur={false}
        fetchDetails={true} // Ensures coordinates are sent to mapController
        onFail={(error) => {
          console.warn("Google Places autocomplete failed:", error);
        }}
        onNotFound={() => {
          console.warn("Google Places autocomplete returned no matches.");
        }}
        textInputProps={{
          value: activeSearchText,
          onChangeText: (text) => activeSetSearchText(text),
          placeholderTextColor: "#8F8F8F",
          returnKeyType: "search",
          onSubmitEditing: () => {
            if (activeGooglePlacesRef.current && activeSearchText.trim() !== "") {
              activeGooglePlacesRef.current.focus();
              activeGooglePlacesRef.current.setAddressText(activeSearchText);
            }
          },
        }}
        onPress={(data, details = null) => {
          if (details && mapRef && setSelectedPlace) {
            goToSearchedPlace(mapRef, details, setSelectedPlace);
          }
          /*Remove logs & alert*/
          /* console.log(data.place_id);
            console.log(details?.name);
            console.log(details?.formatted_address);
            console.log(details?.geometry.location.lat);
            console.log(details?.geometry.location.lng); */

          activeSetSearchText(data.description || "");
        }}
        query={{ //api query
          key: apiKey,
          language: "en",
        }}
        requestUrl={
          Platform.OS === "web"
            ? {
                useOnPlatform: "web",
                url: "https://maps.googleapis.com/maps/api", //google maps api info
              }
            : undefined
        }
        enablePoweredByContainer={false}
        debounce={200}
        nearbyPlacesAPI="GooglePlacesSearch"
        renderRow={(data) => (
          <View style={styles.rowContainer}>
            <Feather name="map-pin" size={18} color="#8F8F8F" style={styles.rowIcon} />
            <Text style={styles.descriptionText} numberOfLines={1}>{data.description}</Text>
          </View>
        )}
        styles={{
          container: {
            flex: 1,
            position: "relative",
            overflow: "visible",
          },
          textInputContainer: {
            flex: 1,
            backgroundColor: "transparent",
            height: 50, // Matches searchContainer height for centering
            justifyContent: 'center',
            alignItems: 'center',
            borderTopWidth: 0,
            borderBottomWidth: 0,
            paddingHorizontal: 0,
            marginHorizontal: 0,
          },
          textInput: {
            height: 40,
            color: "#FFFFFF",
            fontSize: 15,
            backgroundColor: "transparent",
            borderWidth: 0,
            marginTop: 0,
            marginBottom: 0,
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: 0,
            textAlignVertical: 'center',
          },
          listView: {
            position: "absolute",
            top: 55,
            left: 0,
            right: 0,
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            maxHeight: 260,
            zIndex: 5000,
            elevation: 5000,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 5,
          },
          row: {
            backgroundColor: "transparent",
            padding: 0,
          },
          separator: {
            height: 1,
            backgroundColor: "#E8E8E8",
          },
        }}
      />
    </View>
  );
}

export function GooglePlacesInputTrip({ onSelect, placeholder = "Where would you like to go?" }: GooglePlacesInputTripProps) {
  return (
    <View style={styles.tripContainer}>
      <GooglePlacesAutocomplete
        placeholder={placeholder}
        minLength={2}
        listViewDisplayed="auto"
        keyboardShouldPersistTaps="handled"
        fetchDetails={true}
        query={{
          key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "",
          language: "en",
        }}
        enablePoweredByContainer={false}
        debounce={200}
        textInputProps={{
          placeholderTextColor: 'black'
        }
        }
        onPress={(data, details = null) => onSelect(data, details)}
        styles={{
          container: {
            flex: 0,
            width: '100%',
          },
          textInputContainer: {
            width: '100%',
            backgroundColor: "transparent",
          },
          textInput: {
            width: '100%',
            height: 50,
            color: "#5d5d5d",
            fontSize: 16,
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 8,
            paddingHorizontal: 12,
            backgroundColor: 'white'
          },
          predefinedPlacesDescription: {
            color: "#1faadb",
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 1000,
    elevation: 1000,
  },
  tripContainer: {
    width: '100%',
    zIndex: 1000,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  rowIcon: {
    marginRight: 15,
  },
  descriptionText: {
    color: "#333",
    fontSize: 14,
    flex: 1,
  },
});
