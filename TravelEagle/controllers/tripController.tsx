import { tripQueries } from "@/models/trips"




export const tripController = {


    async loadAllTrips(userId: string){
        try{
            const data = await tripQueries.getAll(userId);
            return {data, error: null};
        }
        catch (error){
            console.error('Error loading trips:', error);
            return { data: [], error};
        }
    },

}
