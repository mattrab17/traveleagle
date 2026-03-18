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
     async loadTrip(tripId: number){
        try{
            const data = await tripQueries.getById(tripId);
            return {data, error:null}
            
        }
        catch (error){
            console.error('Error loading trips:', error);
            return { data: [], error};
        }
    },
     getTotalDays(trip: any): number {

        if (!trip?.start_date || !trip?.end_date) return 1;
        const start = new Date(trip.start_date);
        const end = new Date(trip.end_date);
        const diffInTime = end.getTime() - start.getTime();
        return Math.ceil(diffInTime/ (1000 * 60 * 60 * 24)) + 1;
    }
}
    export function goToPreviousMonth(currentMonth: Date) {
            const newMonth = new Date(currentMonth)
            newMonth.setMonth(newMonth.getMonth() - 1);
            return newMonth;
    }

    export function goToNextMonth(currentMonth: Date) {
        const newMonth = new Date(currentMonth)
            newMonth.setMonth(newMonth.getMonth() + 1);
            return newMonth;
    }
    
