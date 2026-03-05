import { itineraryQueries } from "@/models/itinerary";
import { placeQueries } from "@/models/places";


export const itineraryController = {


    async loadAllItems(tripId: number){
        try{
            const data = await itineraryQueries.getAllItems(tripId);
            return {data, error: null};
        }
        catch (error){
            console.error('Error loading trips:', error);
            return { data: [], error};
        }
    },
    async addPlaceFromGoogle(tripId: number, googlePlaceDetails: any, dayNumber: number){
        try{
            //Checks if place_id is in databse already, if not it will insert into place table then itinerary table
            let place = await placeQueries.getByGooglePlaceId(googlePlaceDetails.place_id);

            if (!place) {
                place = await placeQueries.create({
                    google_place_id: googlePlaceDetails.place_id,
                    name: googlePlaceDetails.name,
                    address:googlePlaceDetails.formatted_address,
                    lat: googlePlaceDetails.geometry.location.lat,
                    lng: googlePlaceDetails.geometry.location.lng,
                    place_data: googlePlaceDetails,
                });
            }
        const itemsOnDay = await itineraryQueries.getByDay(tripId, dayNumber);
        const orderIndex = itemsOnDay.length;
        //Query will temporarily insert items at the back of the array by default. 
        //Will change to order by Time later (or other ordering methods)
        const item = await itineraryQueries.addItem({
            trip_id: tripId,
            place_id: place.places_id,
            day_number: dayNumber,
            order_index: orderIndex,
        });
        return {data: item, error:null};

        }
        catch(error){
            console.error('Error adding place:', error);
            return {data: null, error}
        }  
        
    },
};