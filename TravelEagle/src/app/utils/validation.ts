


import { Alert } from "react-native";



export function validateTripForm(destination: string, startDate: string | undefined, endDate: string | undefined) : boolean {
    if (!destination){
        Alert.alert('Error', 'Please enter a destination')
        return false;
    }

    if (!startDate || !endDate){
        Alert.alert('Error', 'Please select start and end dates')
        return false;
    }
    return true;
} 