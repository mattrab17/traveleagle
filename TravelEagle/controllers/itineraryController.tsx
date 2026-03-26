import { itineraryQueries } from "@/models/itinerary";
import { placeQueries } from "@/models/places";
import { tripController } from "./tripController";


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
    async addPlaceFromGoogle(tripId: number, googlePlaceDetails: any, dayNumber: number, notes?: string){
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
            notes: notes || null,
            //time_slot: timeSlot
            
        });
        return {data: item, error:null};

        }
        catch(error){
            console.error('Error adding place:', error);
            return {data: null, error}
        }  
        
    },

     async addPlaceFromGoogleMaps(tripId: number, googlePlaceDetails: any, time: any){
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
                    place_data: googlePlaceDetails.place_data,
                });
            }
        const items = await itineraryQueries.getAllItems(tripId)
        const orderIndex = items.length;
        const trip = tripController.loadTrip(tripId);
        const lastDay = tripController.getTotalDays(trip);
        //Query will temporarily insert items at the back of the array by default. 
        //Will change to order by Time later (or other ordering methods)
        
        const formattedTime = time.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: false
                });
        
        const item = await itineraryQueries.addItem({
            trip_id: tripId,
            place_id: place.places_id,
            day_number: lastDay,
            order_index: orderIndex,
            notes: null,
            time_slot: formattedTime
            
        });
        return {data: item, error:null};

        }
        catch(error){
            console.error('Error adding place:', error);
            return {data: null, error}
        }  
        
    },
    async deleteItemFromItinerary(itemId: number){

        try{
            await itineraryQueries.deleteItem(itemId);
            return {error: null};
        }
        catch (error){

            return {error};

        }
    }
};