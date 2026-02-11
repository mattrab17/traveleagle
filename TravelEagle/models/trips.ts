import { supabase } from "@/lib/supabase";
import { Trip } from "./supabase";
import { updateCSSTransition } from "react-native-reanimated/lib/typescript/css/native";


export const tripQueries = {

    async getAll(userId: number): Promise<Trip[]>{
        let { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', {ascending: false});

        if (error) throw error;
        return data || [];
    },

    async getById(tripId: number): Promise<Trip | null>{
     const { data, error } = await supabase 
     .from('trips') 
     .select('*')
     .eq('trip_id', tripId)
     .single();

     if (error) throw error;
     return data;
    },

    async create(trip: {
        user_id: number;
        destination: string;
        start_date: string;
        end_date:string;}):
        Promise<Trip>{
            const { data, error } = await supabase 
            .from('trips')
            .insert(trip)
            .select()
            .single();

        if (error) throw error;
        return data;
    },
    async update(tripId: number, updates: Partial<Trip>): Promise<Trip>{
        const { data, error } = await supabase 
        .from('trips')
        .update(updates)
        .eq('trip_id', tripId)
        .select()
        .single();

        if (error) throw error;
        return data;
    },
    async delete(tripId: number): Promise<void>{
        const {error} = await supabase
        .from('trips')
        .delete()
        .eq('trip_id', tripId);

        if (error) throw error;
    }

    };

    
