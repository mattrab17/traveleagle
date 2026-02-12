
import {supabase} from '@/lib/supabase'
import { Place } from './supabase'


export const placeQueries = {
    
    async getById(placeId: number): Promise<Place | null>{
     const { data, error } = await supabase 
     .from('places')
     .select('*')
     .eq('places_id', placeId)
     .single()
    
    if (error) throw error;
    return data;
    },

    async getByGooglePlaceId(googlePlaceId: string): Promise<Place | null> {
        const {data, error} = await supabase
        .from('places')
        .select('*')
        .eq('google_place_id', googlePlaceId)
        .single();


        if(error) throw error;
        return data;
    },

    async create(place: {
        google_place_id: string;
        name: string;
        address: string;
        lat: number;
        lng: number;
        place_data?: Record<string, any>;

    }): Promise<Place> {
        const {data,error} = await supabase
        .from('places')
        .insert({
            ...place,
            cached_at: new Date().toISOString()
        })
        .select()
        .single()

        if (error) throw error;
        return data;
    },




};