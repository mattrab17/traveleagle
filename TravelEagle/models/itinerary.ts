import { supabase } from "@/lib/supabase";
import { ItineraryItems } from "./supabase";

export const itineraryQueries = {

    async getAllItems(tripId: number): Promise<ItineraryItems[]>{
     const { data, error } = await supabase 
        .from('itinerary_items')
        .select('*, place:places(*)')
        .eq('trip_id', tripId)
        .order('day_number', {ascending: true})
        .order('time_slot', {ascending: true, nullsFirst:false})
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
         .order('time_slot', {ascending: true, nullsFirst:false})
         .order('order_index');

         if(error) throw error;
         return data || [];
    },

   async addItem(item: {
        trip_id: number;
        place_id: number;
        day_number: number;
        time_slot?: string;
        notes?: string | null;
        order_index?:number;
    }): Promise<ItineraryItems>{
        const {data, error} = await supabase
        .from('itinerary_items')
        .insert(item)
        .select('*, place:places(*)')
        .single();
        if (error) throw error;
        return data;
    },
    async updateItem(itemId: number, updates:{
        time_slot?: string | null;
        day_number: number;
        notes?: string | null;
    }) {
        const {data, error} = await supabase
        .from('itinerary_items')
        .update(updates)
        .eq('id', itemId)
        .select('*, place:places(*)')
        .single();
        if (error) throw error;
        return data;
    },

    async deleteItem(itemId: number){
        const {error}  = await supabase
        .from('itinerary_items')
        .delete()
        .eq('id', itemId)

        if (error) throw error;

    }
}