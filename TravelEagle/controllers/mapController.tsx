export const animateToRegion = (mapRef, lat, lng) =>{
    mapRef.current.animateToRegion(
              {
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              },
              500,
            );
}
export const goToSelectedPlace = (mapRef, details, setSelectedPlace) => {

        const name = details.name;
        const lng = details.geometry.location.lng;
        const lat = details.geometry.location.lat;
        const description = details.editorial_summary?.overview;
    setSelectedPlace({
        name, lng, lat, description
    });

    animateToRegion (mapRef, lat, lng)
};
export const fitMarkerstoScreen  = (mapRef, places) => {
    const coordinates = places.map(place => ({latitude: place.lat, longitude: place.lng }));

    mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: {top: 70, right: 70, bottom: 70, left: 70},
        animated: true,
        });
    };
