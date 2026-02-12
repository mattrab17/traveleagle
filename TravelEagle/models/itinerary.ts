import { supabase } from "@/lib/supabase";
import { ItineraryItems } from "./supabase";

export const itineraryQueries = {

    async getAllItems(tripId: number): Promise<ItineraryItems[]>{
     const { data, error } = await supabase 
        .from('itinerary_items')
        .select('*, place:places(*)')
        .eq('trip_id', tripId)
        .order('order_index', {ascending: true} );
     if (error) throw error;
     return data || [];
    },

    async getByDay (tripId: number, dayNumber: number): Promise<ItineraryItems[]>{
         const { data, error } = await supabase 
         .from('itinerary_items')
         .select('*, place:places(*)')
         .eq('trip_id', tripId)
         .eq('day_number', dayNumber)
         .order('order_index');

         if(error) throw error;
         return data || [];
    }

    /* async addItem(item: {
        trip_id: number;
        place_id: number;
        day_number: number;
        time_slot?: string;
        notes?: string;
    }): Promise<ItineraryItem>{

    }
    */
}