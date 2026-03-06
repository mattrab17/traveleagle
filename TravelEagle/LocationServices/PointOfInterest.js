export class PlacesAPI {
  constructor(apiKey) {
    this.apiKey = process.env.EXPO_PUBLIC_GEOAPIFY_KEY;
    this.baseUrl = "https://api.geoapify.com/v2/places";
  }

  async findPlaces({
    userLocation,
    searchedPlace,
    category = "leisure.park",//later change this to category the user selects
    radius = 2500,
    limit = 10,//will only show 10 closest markers to stop map from slowing in performance
  }) {
    const lat =
      searchedPlace?.lat != null ? searchedPlace.lat : userLocation?.latitude;
    const lng =//checks to see if lat and longitude of user and searched place exist
      searchedPlace?.lng != null ? searchedPlace.lng : userLocation?.longitude;

    if (lat == null || lng == null) return [];
      //if values dont exist b/c user didnt search or give their location, API wont be called
    const params = new URLSearchParams({// params determine what will be returned from the GET
      categories: category,
      filter: `circle:${lng},${lat},${radius}`,//the radius will return POIs within 2500 meters
      bias: `proximity:${lng},${lat}`,
      limit: String(limit),
      apiKey: this.apiKey,
    });

    const url = `${this.baseUrl}?${params.toString()}`;
    //sample url: "https://api.geoapify.com/v2/places?categories=catering
    // .cafe&filter=circle:-73.90708332629015,40.69389620721586,1000&bias=
    // proximity:-73.90708332629015,40.69389620721586&limit=20&apiKey=YOUR_API_KEY"
    try {
      const response = await fetch(url);//fetches the data from the API
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();//geoApify will send the data in a JSON format
      return this.processPlaces(data.features || []);//this will return a response in an array, if there is no suitable POIs it will return nothing
    } catch (error) {
      throw error
    }
  }

  processPlaces(features) {
    return features.map((feature, index) => {
      const props = feature.properties || {};//returns the properties, which include address
      const coords = feature.geometry?.coordinates || [];//returns coordinates in [lng,lat] format

      return {
        id: props.place_id || [],//will return geoapify's place_id for the location
        name: props.name || "Unknown",
        address: props.formatted || "No address available",
        longitude: coords[0],
        latitude: coords[1],
        categories: props.categories || [],//will return the catgory the POI aligns with
        contact: {
          phone: props.contact?.phone,
          website: props.website || props.contact?.website,
        },
        original: feature,
      };
    });
  }
}
