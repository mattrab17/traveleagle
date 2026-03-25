//PlacesAPI is the helper class that talks to Geoapify and prepares marker data for the map.
export class PlacesAPI {
  //constructor runs once when we create a new PlacesAPI object.
  constructor(apiKey) {
    //use the Geoapify key from environment variables for authenticated requests.
    this.apiKey = process.env.EXPO_PUBLIC_GEOAPIFY_KEY;
    //base endpoint for Geoapify Places API searches.
    this.baseUrl = "https://api.geoapify.com/v2/places";
    //categoryAliases translates alternative or legacy categories into valid Geoapify categories.
    this.categoryAliases = {
      //map old gas category to Geoapify's vehicle fuel category.
      "commercial.gas": "service.vehicle.fuel",
      //map another old fuel category to the same correct fuel category.
      "commercial.fuel": "service.vehicle.fuel",
      //map shorthand gas keyword to proper Geoapify category.
      "gas": "service.vehicle.fuel",
      //map shorthand fuel keyword to proper Geoapify category.
      "fuel": "service.vehicle.fuel",
      //map plural rental cars key to singular Geoapify category.
      "rental.cars": "rental.car",
    };
  }

  //normalizeCategories makes sure filter categories are valid, non-empty, and unique.
  normalizeCategories(selectedFilters = []) {
    //if selectedFilters is not an array, return an empty list to avoid runtime errors.
    if (!Array.isArray(selectedFilters)) return [];
    //return unique mapped categories by removing empty values and applying aliases.
    return [...new Set(
      //iterate through the selected filters array.
      selectedFilters
        //remove null/undefined/empty values before mapping.
        .filter(Boolean)
        //replace aliased category keys with the canonical key if one exists.
        .map((category) => this.categoryAliases[category] || category)
    )];
  }

  //createSearchParams builds query params that Geoapify expects for place search.
  createSearchParams({ categories, lng, lat, radius, limit }) {
    //return URLSearchParams object for the GET request.
    return new URLSearchParams({// params determine what will be returned from the GET
      //join selected categories into a comma-separated list for Geoapify.
      categories: categories.join(","),//this will join the selected categories together into an array
      //search inside a circle centered at lng/lat with the given radius in meters.
      filter: `circle:${lng},${lat},${radius}`,//the radius will return POIs within 2500 meters
      //bias ranking toward the center location so nearby places are prioritized.
      bias: `proximity:${lng},${lat}`,
      //limit the maximum number of places returned by this request.
      limit: String(limit),
      //attach API key for authorization.
      apiKey: this.apiKey,
    });
  }

  //fetchPlacesByRadius makes one Geoapify request for a specific radius.
  async fetchPlacesByRadius({ categories, lng, lat, radius, limit }) {
    //build URL parameters using the provided search values.
    const params = this.createSearchParams({ categories, lng, lat, radius, limit });
    //build full request URL from base path plus query string.
    const url = `${this.baseUrl}?${params.toString()}`;
    //send request to Geoapify.
    const response = await fetch(url);//fetches the data from the API
    //throw an error if HTTP status is not in the 2xx success range.
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    //parse JSON response body into a JavaScript object.
    const data = await response.json();//geoApify will send the data in a JSON format
    //return features array or empty array when no features were returned.
    return data.features || [];
  }

  //makePlaceKey generates a unique stable key so duplicate places can be filtered out.
  makePlaceKey(feature, index) {
    //read place properties safely and fallback to empty object.
    const props = feature.properties || {};
    //read coordinate array safely and fallback to empty array.
    const coords = feature.geometry?.coordinates || [];
    //read Geoapify place id if available.
    const placeId = props.place_id;
    //if place_id exists, use it because it is the most reliable unique key.
    if (placeId) return `id:${placeId}`;
    //otherwise build a fallback key from name + coordinates + index.
    return `fallback:${props.name || "unknown"}:${coords[0] || 0}:${coords[1] || 0}:${index}`;
  }

  //searchWithExpandingRadius starts close to center and expands outward until max search radius is reached
  async searchWithExpandingRadius({
    //categories is the normalized list of Geoapify category filters.
    categories,
    //lng is the center longitude for circular searches.
    lng,
    //lat is the center latitude for circular searches.
    lat,
    //maxRadius is the largest allowed search radius in meters.
    maxRadius,
    //initialRadius is the first (smallest) radius used.
    initialRadius,
    //radiusStep is how much each loop increases the radius.
    radiusStep,
    //limit is the target number of unique places to collect.
    limit,
  }) {
    //startRadius clamps the starting radius to a sensible minimum and max cap.
    const startRadius = Math.max(250, Math.min(initialRadius, maxRadius));
    //stepSize guarantees each expansion jump is at least 250 meters.
    const stepSize = Math.max(250, radiusStep);
    //maxSearchRadius guarantees max is never below start.
    const maxSearchRadius = Math.max(startRadius, maxRadius);
    //seen stores place keys already added so duplicates are skipped.
    const seen = new Set();
    //collected stores unique features gathered across all radius passes.
    const collected = [];

    //EXPANDING RADIUS SEARCH LOGIC==============================
    //Start near the center point first, then make the circle larger and larger
    //until we either hit the max radius or collect enough places.
    for (let currentRadius = startRadius; currentRadius <= maxSearchRadius; currentRadius += stepSize) {
      //remaining is how many places we still need to reach our requested limit.
      const remaining = Math.max(limit - collected.length, 1);
      //request places using the current radius.
      const placesAtRadius = await this.fetchPlacesByRadius({
        //send categories for filtering by type.
        categories,
        //send center longitude.
        lng,
        //send center latitude.
        lat,
        //send the current expanding radius.
        radius: currentRadius,
        //send how many additional results we still want.
        limit: remaining,
      });

      //Store only unique locations so the same place from overlapping circles doesn't duplicate.
      placesAtRadius.forEach((feature, index) => {
        //build a unique key for the current feature.
        const key = this.makePlaceKey(feature, index);
        //if this key hasn't been seen, add it to results.
        if (!seen.has(key)) {
          //track this key as seen.
          seen.add(key);
          //push unique feature into collected results.
          collected.push(feature);
        }
      });

      //stop early if we already reached the requested limit.
      if (collected.length >= limit) break;
      //adjust loop so final iteration can hit exact max radius when step doesn't divide evenly.
      if (currentRadius + stepSize > maxSearchRadius && currentRadius !== maxSearchRadius) {
        //set currentRadius so the next increment lands exactly on maxSearchRadius.
        currentRadius = maxSearchRadius - stepSize;
      }
    }

    //return all unique features collected during expanding search.
    return collected;
  }

  //findPlaces is the main public method used by the map screen.
  async findPlaces({
    //userLocation contains current device coordinates.
    userLocation,
    //searchedPlace contains coordinates from selected/search place when available.
    searchedPlace,
    //selectedFilters contains currently active filter categories.
    selectedFilters = [],
    //radius is the maximum search radius allowed.
    radius = 2500,
    //initialRadius is where expanding search starts.
    initialRadius = 2500,
    //radiusStep is how much radius grows each pass.
    radiusStep = 2500,
    //limit caps total returned places for performance and UI readability.
    limit = 10,//will only show 10 closest markers to stop map from slowing in performance
  }) {
    //center prefers searchedPlace first, then userLocation, then empty object fallback.
    const center = searchedPlace ?? userLocation ?? {};
    //lat resolves either from .lat or .latitude formats.
    const lat = center?.lat ?? center?.latitude;
    //lng resolves either from .lng or .longitude formats.
    const lng = center?.lng ?? center?.longitude;
    //checks to see if lat and longitude of searched place exist

    //normalize category keys and remove invalid values.
    const normalizedCategories = this.normalizeCategories(selectedFilters);

    //if coordinates/categories/key are missing, return empty list and skip API calls.
    if (lat == null || lng == null || normalizedCategories.length === 0 || !this.apiKey) return [];
      //if values dont exist b/c user didnt search or give their location, API wont be called
    
    //try-catch handles request errors cleanly.
    try {
      //run expanding radius search and gather unique features.
      const features = await this.searchWithExpandingRadius({
        //use normalized category list.
        categories: normalizedCategories,
        //use resolved longitude.
        lng,
        //use resolved latitude.
        lat,
        //pass max radius limit.
        maxRadius: radius,
        //pass first radius.
        initialRadius,
        //pass radius growth amount.
        radiusStep,
        //pass target max number of unique places.
        limit,
      });
      //convert raw Geoapify features into app-specific marker objects.
      return this.processPlaces(features);//this will return a response in an array, if there is no suitable POIs it will return nothing
    } catch (error) {
      //rethrow error so caller can decide how to display/log failure.
      throw error
    }
  }

  //processPlaces maps raw Geoapify feature objects into your marker shape.
  processPlaces(features) {
    //map each raw feature into a cleaned object used in the map UI.
    return features.map((feature, index) => {
      //read properties safely from feature.
      const props = feature.properties || {};//returns the properties, which include address
      //read [lng, lat] safely from geometry.
      const coords = feature.geometry?.coordinates || [];//returns coordinates in [lng,lat] format

      //return normalized place object for marker rendering.
      return {
        //id is Geoapify place id when available.
        id: props.place_id || [],//will return geoapify's place_id for the location
        //name is place name or fallback label.
        name: props.name || "Unknown",
        //address is formatted address or fallback message.
        address: props.formatted || "No address available",
        //longitude comes from coordinates index 0.
        longitude: coords[0],
        //latitude comes from coordinates index 1.
        latitude: coords[1],
        //categories are all categories returned for the place.
        categories: props.categories || [],//will return the catgory the POI aligns with
        //contact object groups optional communication fields.
        contact: {
          //phone is place phone when present.
          phone: props.contact?.phone,
          //website prefers top-level website then contact website.
          website: props.website || props.contact?.website,
        },
        //original keeps full raw feature for advanced usage/debugging.
        original: feature,
      };
    });
  }
}
