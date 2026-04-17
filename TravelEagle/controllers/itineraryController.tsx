import { itineraryQueries } from "@/models/itinerary";
import { placeQueries } from "@/models/places";
import { tripController } from "./tripController";
import { generateItineraryFromGemini } from "./geminiController";


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
    async addPlaceFromGoogle(
        tripId: number,
        googlePlaceDetails: any,
        dayNumber: number,
        notes?: string,
        timeSlot?: string
    ){
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
            time_slot: timeSlot || undefined
            
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
   async updateItem(itemId: number, updates:{
        time_slot?: string | null;
        day_number: number;
        notes?: string | null;
    }) {
        try {
            const data = await itineraryQueries.updateItem(itemId, updates);
            return{data, error:null};
        }
        catch (error) {
            console.error('Error updating itinerary item:', error);
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
    },
    async generateAIItinerary(trip: any, numDays, interests, onStatus?){
        try{
            onStatus?.("Generating Itinerary...")
            const result = await generateItineraryFromGemini(trip, numDays, interests);
            
            // console.log('Gemini Result:', JSON.stringify(result, null, 2))
            onStatus?.("Getting activities...")
            for(const day of result.itinerary){
            for(const activity of day.activities){
                try{
                    /* console.log('Searching place on api'); */
                    const placeDetails = await searchPlacesAPI(
                            activity.place_name,
                            activity.place_address,
                        );
                        if(placeDetails){
                            console.log(placeDetails?.id);
                            console.log(placeDetails.location);
                            let place = await placeQueries.getByGooglePlaceId(placeDetails.id);
                            
                            if (!place) {
                                place = await placeQueries.create({
                                google_place_id: placeDetails.id,
                                name: activity.place_name,
                                address:activity.place_address,
                                lat: placeDetails.location.latitude,
                                lng: placeDetails.location.longitude,
                                place_data: {photo_url: placeDetails?.photos[0] ?
                                    `https://places.googleapis.com/v1/${placeDetails.photos[0].name}/media?maxHeightPx=400&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}` 
                                    : null}
                });
            }
                                await itineraryQueries.addItem({
                                trip_id: trip.trip_id,
                                place_id: place.places_id,
                                day_number: day.day_number,
                                order_index: activity.order_index,
                                notes: activity.notes,
                                time_slot: activity.start_time
                                
                            });
                            onStatus?.('Saving Activities...');
                    
                
                        }

                }
                catch(error){
                    console.warn("Failed to search places API", error)
                }
            }
        }
        onStatus?.("Finished Building Itinerary");   
        return {error: null}
        }
        catch (error) {
            console.log('Failed to generate an itinerary');
            return {data: null, error}
        }
    
     
     

    }
};
async function searchPlacesAPI(
    placeName, placeAddress
): Promise<any | null>{


    try{
        const response = await fetch(
           "https://places.googleapis.com/v1/places:searchText",
           {
            method: "POST",
            headers:{
                "Content-Type": "applications/json",
                "X-Goog-API-KEY": process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!,
                "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.photos",
            },
            body: JSON.stringify({
                textQuery: `${placeName} ${placeAddress}`,
                maxResultCount: 1,
            }),
           }
        );
        if(!response.ok){
                console.warn(`Places API error for "${placeName}"`);
                return null;
        }
        const data = await response.json();
        return data.places?.[0] || null;

    }
    catch(error){
        console.warn(`Places search failed for ${placeName}`, error);
        return null;
    }
};