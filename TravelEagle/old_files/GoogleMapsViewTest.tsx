/*
RESOURCES:

1. React.dev (Official Docs) - Hooks and how to use useMemo
2. MDN Web Docs - includes .map()
3. JavaScript.info - included a breakdown of array manipulation syntax 
4. Expo official website - included a breakdown of Maps and how to implement it into the app



*/


// useMemo lets the app "cache" a computed value so it doesn’t regenerate on every render
// useMemo is a hook that tells React to remember the result of a complex calculation
// we use useMemo to ensure that React generates the pins exactly once

//Hooks - give components memory like allowing them to save data or run actions automatically 
import React, { useMemo } from "react";

// StyleSheet = defines styles in React Native
import { StyleSheet } from "react-native";

// MapView = the map component, Marker = map pins, PROVIDER_GOOGLE = use Google Maps
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

// Defines where the map starts -> (Times Square)
const INITIAL_REGION = {
  latitude: 40.758,
  longitude: -73.9855,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

// This function creates a list of random fake pins
//centerLat = latitude of pin
//centerLng = longitude of pin
// count = how many pins we want to create
function buildPlaceholderPins(centerLat, centerLng, count) {
  let pins = []; //pins are held in an array
  
    // Generate a small random latitude offset
    // Math.random() gives a value from 0 to 1
    // subtract 0.5 to get 0.5
    // multiply by 0.06 keeps it close to center
  for (let i = 0; i < count; i++) { //go through count
    
    const latOffset = (Math.random() - 0.5) * 0.06; //spread the pins out along the x axis
    const lngOffset = (Math.random() - 0.5) * 0.06; //spread the pins out along the y axis

    
    pins.push({ //add a pin object to pins
      id: "pin-" + (i + 1), //pin has id "pin-#"
      latitude: centerLat + latOffset, //defines a pin's final latitude
      longitude: centerLng + lngOffset, //defines a pins final longitude
      title: "Sample Place " + (i + 1), //temporary title for a pin
      description: "Temporary marker for testing map pin rendering.", //temporary description for a pin
    });
  }
  return pins; //After adding all pins to the pins list, return them all
}

//Main GoogleMapsView component export function=================================================
export default function GoogleMapsView() {
  // useMemo runs this ONCE when the app starts ([ ] means run once)
  const placeholderPins = useMemo(() => { //function to render pins using the previous buildPlaceHolderPins function
    return buildPlaceholderPins(INITIAL_REGION.latitude, INITIAL_REGION.longitude, 6);
  }, []);

  // Return to the screen
  return ( 
    <MapView //Map SDK used to generate the Google Maps map 
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={INITIAL_REGION}
    >
      {/* Go through the list of pins and put a Marker on the map for each one */}
      
      {placeholderPins.map((pin) => ( //every pin receives a "marker" on the map
        <Marker
          key={pin.id}
          coordinate={{
            latitude: pin.latitude,
            longitude: pin.longitude,
          }}
          title={pin.title}
          description={pin.description}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1, //tells the map component to take up the entire screen
  },
});