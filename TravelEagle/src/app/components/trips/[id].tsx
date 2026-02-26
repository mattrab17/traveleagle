import { tripController } from "@/controllers/tripController";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View, TouchableOpacity} from "react-native";
import { Ionicons } from "@expo/vector-icons";





export default function TripScreen(){
    const { id } = useLocalSearchParams();
    const [trip, setTrip] = useState<any>([]);
    const router = useRouter();

    
    useEffect(() => {
        async function loadTrip(){
            const {data} = await tripController.loadTrip(Number(id));
            setTrip(data);
            console.log(data)
        }
            loadTrip();}, [id]);
    return(
        
        <View style={{flex:1 , padding:20, marginVertical:40, }}>  
        <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name='arrow-back' size={20} color='white'></Ionicons>
        </TouchableOpacity>
        <View style={{flexDirection: 'column', alignItems: 'flex-start', alignSelf: 'flex-start', paddingTop: 40, paddingLeft: 15 }}>
        <Text style={{ fontSize: 24, color: 'white', fontWeight: 'bold', fontFamily: 'Inter' }}> Trip to {trip.destination} </Text>
        <View style={{flexDirection: 'row', gap: 2, paddingTop: 10, alignSelf: 'center'}}>
        <Text style={{ fontSize: 9, color: 'white', fontWeight: '700', fontFamily: 'Inter' }}> {trip.start_date} </Text>
        <Text style={{color: 'white', fontWeight: '700', fontSize: 8}}>  - </Text>
        <Text style={{ fontSize: 9, color: 'white', fontWeight: '700', fontFamily: 'Inter' }}> {trip.end_date} </Text>
        </View>
        </View>
        <View style={{marginTop: 20, backgroundColor: '#cccccc',  flex: 1, borderRadius: 15, padding: 20}}>
            <View style={{paddingTop: 40, borderRadius: 15, backgroundColor: 'white', minHeight: 250}}>
            </View>
            <View style={{marginTop: 20, borderRadius: 15, backgroundColor: 'white', flex: 1}}>
                <Text style={{fontSize:16, fontWeight: 15}}> Itinerary </Text>
            </View>
            
            
            
            </View>
           
            
            
        </View>
    )
}