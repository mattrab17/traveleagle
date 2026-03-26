/**
 * ANIMATE TO REGION
 * Goal: to move the map camera to a specific GPS coordinate.
 * @param mapRef - The 'remote control' for the MapView component.
 * @param lat - Latitude of the destination.
 * @param lng - Longitude of the destination.
 */
export const animateToRegion = (mapRef, lat, lng) =>
{
    
  // Access the current map instance through the Ref
  mapRef.current.animateToRegion(
    {
      latitude: lat,
      longitude: lng,
      // 'Delta' determines the zoom level. Smaller numbers = closer zoom.
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    },
    // The duration of the animation in milliseconds (500ms = 0.5 seconds)
    500,
  );
};

/**
 * BUILDS THE GOOGLE PHOTO URL
 * Converts a photo reference ID from Google into a usable URL
 */
const buildGooglePhotoUrl = (photoReference, apiKey) => {
  // Safety check: if there is no photo or no API key, return nothing.
    if (!photoReference || !apiKey) return undefined;
    
  // Construct the specific URL format required by the Google Places Photo API
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=900&photoreference=${photoReference}&key=${apiKey}`;
};

/**
 * GETS THE CROWD LEVEL
 */
const getCrowdLevel = (userRatingsTotal) => {
  //not finished
};

/**
 * ADDS LOCATION OPEN HOURS
 */
const formatOpenHours = (openingHours) =>
{
    //if there's no opening hours, return unavailable
    if (!openingHours) return "Not available";
    
  // if there's a list of hours, separate them with |j
  if (Array.isArray(openingHours.weekday_text) && openingHours.weekday_text.length > 0) {
    return openingHours.weekday_text.join(" | ");
  }
 
  return "Not available";
};

/**
 * MAPS LOCATION DETAILS TO THE SELECTED PLACE
 * Only our wanted informmation from the Google object is extracted
 */
const mapGoogleDetailsToSelectedPlace = (details, fallback = {}) => {
  
    // Retrieves the API key from our environment variables
  const apiKey = (process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "").trim();
  
  //'Optional Chaining' or ? allows our app to safely access data without crashing if something is missing
  const lat = details?.geometry?.location?.lat ?? fallback.lat;
  const lng = details?.geometry?.location?.lng ?? fallback.lng;
  const photoReference = details?.photos?.[0]?.photo_reference;

  // Returns an object
  return {
    name: details?.name || fallback.name || "Selected Place",
    lng,
    lat,
    description: details?.editorial_summary?.overview || fallback.description,
    rating: typeof details?.rating === "number" ? details.rating : fallback.rating,
    address: details?.formatted_address || fallback.address || "Not available",
    website: details?.website || fallback.website || "Not available",
    openHours: formatOpenHours(details?.opening_hours || fallback.opening_hours),
    crowdLevel: getCrowdLevel(details?.user_ratings_total),
    photoUrl: buildGooglePhotoUrl(photoReference, apiKey) || fallback.photoUrl,
    placeId: details?.place_id || fallback.placeId,
    place_id: details?.place_id,
    formatted_address: details.formatted_address,
    place_data: details,
    geometry: details?.geometry,

  };
};

/**
 * GO TO SEARCHED PLACE
 * This is triggered when a user clicks on a place in the search bar
 */
export const goToSearchedPlace = (mapRef, details, setSelectedPlace) => {
  
    // cleans the data
  const enrichedPlace = mapGoogleDetailsToSelectedPlace(details);
  // updates the map view so that the selected place is shown
  setSelectedPlace(enrichedPlace);

  // if coordinates exist, take the user to that place
  if (enrichedPlace?.lat != null && enrichedPlace?.lng != null) {
    animateToRegion(mapRef, enrichedPlace.lat, enrichedPlace.lng);
  }
};

/**
 * Function for pressing a random marker on the map without searching for something
 * what is fetched -> (photos, website, hours).
 */
export const enrichPlaceFromMapPin = async ({ name, lat, lng, description, address, placeId, popularity }) => {
  const apiKey = (process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "").trim();
  
  // fallback case in case the API call fails
  const fallback = {
    name, lat, lng, description, address,
    crowdLevel: typeof popularity === "number"
      ? (popularity > 0.85 ? "High" : popularity > 0.6 ? "Moderate" : "Low")
      : "Not available",
  };

  if (!apiKey || lat == null || lng == null) return fallback;

  try {
    let resolvedPlaceId = placeId;

    // perform a nearby search if placeId doesn't exist
    if (!resolvedPlaceId) {
      const nearbyParams = new URLSearchParams({
        location: `${lat},${lng}`,
        radius: "120", // Look within 120 meters
        keyword: name || "",
        key: apiKey,
      });

      const nearbyResponse = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?${nearbyParams.toString()}`);
      const nearbyJson = await nearbyResponse.json();
      resolvedPlaceId = nearbyJson?.results?.[0]?.place_id;
    }

    if (!resolvedPlaceId) return fallback;

    // Use the PlaceID to fetch details like: Website, Reviews, Photos...
    const detailsParams = new URLSearchParams({
      place_id: resolvedPlaceId,
      fields: "name,geometry,formatted_address,rating,user_ratings_total,website,opening_hours,photos,editorial_summary,place_id",
      key: apiKey,
    });

    const detailsResponse = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${detailsParams.toString()}`);
    const detailsJson = await detailsResponse.json();
    const details = detailsJson?.result;

    if (!details) return { ...fallback, placeId: resolvedPlaceId };

    // merge google's details into our local data
    const merged = mapGoogleDetailsToSelectedPlace(details, fallback);
    return {
      ...merged,
      crowdLevel: merged.crowdLevel === "Not available" ? fallback.crowdLevel : merged.crowdLevel,
    };
  } catch (error) {
    console.error("Error enriching place:", error);
    return fallback;
  }
};

/**
 * fits markers to the screen
 */
export const fitMarkerstoScreen = (mapRef, places) => {
  // Creates a simple array of coordinates
  const coordinates = places.map(place => ({ latitude: place.lat, longitude: place.lng }));

  // adjust the view of the map
  mapRef.current.fitToCoordinates(coordinates, {
    // ensures markers are separated and aren't overlapping
    edgePadding: { top: 70, right: 70, bottom: 70, left: 70 },
    animated: true,
  });
};