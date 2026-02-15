import {Calendar, toDateId, useDateRange} from "@marceloterreiro/flash-calendar"
import { View, Text, TouchableOpacity } from "react-native";
import {GooglePlacesInputTrip} from "../(google_maps_info)/GooglePlacesAutocomplete";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useState } from "react";
import { tripQueries } from "@/models/trips";

export default function TripForm({onClose}) {

    const [destination, setDestination] = useState('')
    const { calendarActiveDateRanges, onCalendarDayPress, dateRange, onClearDateRange} = useDateRange();
    const today = toDateId(new Date());
    


  async function handleCreate(){
  try {
    const data = await tripQueries.create({
        //Temporary id for now, will add auth later...
      user_id: 'bde439b9-f312-45af-81b2-f07e1ee74648',
      destination: destination,
      start_date: dateRange.startId,
      end_date: dateRange.endId,
    });
    console.log('Trip created:', data);
    onClearDateRange();
    setDestination('');
    onClose();
  }
  catch (error) {
    console.error('Error:', error);
    alert('Failed to create trip')
  }
}
    return(
        <View style={{padding:15, paddingTop:20, flex:1}}>
            
            <Text style={{ fontSize: 20, color: "black" }}>Add a Trip</Text>
            <Text style={{ fontSize:16, color: "black", paddingVertical: 20 }}>Plan out your new trip by building an Itinerary</Text>


            {/* Destination Box/Input */}
            <Text style={{fontSize: 16, marginBottom: 10,}}>Destination</Text>
            <View style={{flex:1, width:'100%', marginBottom: 20, zIndex:1 }}>
                <GooglePlacesInputTrip 
                onSelect={(data) => setDestination(data.description)}
                placeholder="Where are you going?">
                </GooglePlacesInputTrip>
            </View>

            {/* Destination Box/Input */}
            <Text style={{ fontSize:20, marginBottom: 15}}>Select Dates</Text>
            <View style={{flex:1}}>
      {/* Need to add buttons to swtich the month on the calender */}
            <Calendar
                calendarMonthId={today}
                calendarActiveDateRanges={calendarActiveDateRanges}
                onCalendarDayPress={onCalendarDayPress}   
                           
            /></View>
            <View style={{marginTop: 15, flexDirection: "row", gap:10}}>
                <View style={{
                    flex: 1,
                    backgroundColor: 'white',
                    padding: 10,
                    borderRadius:10,
                    borderWidth:1,
                    borderColor: '#ddd'
                }}>
                <Text style={{fontSize:12, color: '#777676', }}>
                    Start
                </Text>
                <Text style={{fontSize: 14, fontWeight: '500'}}>
                    {dateRange.startId || 'Select a Starting Date'}
                </Text>
                </View>

                <View style={{
                    flex: 1,
                    backgroundColor: 'white',
                    padding: 10,
                    borderRadius:10,
                    borderWidth:1,
                    borderColor: '#ddd'
                }}>
                <Text style={{fontSize:12, color: '#777676', }}>
                    End
                </Text>
                <Text style={{fontSize: 14, fontWeight: '500'}}>
                    {dateRange.endId || 'Select an Ending Date'}
                </Text>
                </View>
                </View>

            
            <View style={{marginTop: 50}}>
                <TouchableOpacity
             style={{
                position:'absolute',
                top:0,
                right:0,
                padding:10,
                backgroundColor: '#e7e7e7',
                borderRadius:10,
                marginTop: 20,
                width: '30%',
                alignContent: 'center',
                alignItems: 'center'
            }}
            onPress={handleCreate}
            >
                <Text>Create Trip</Text>
            </TouchableOpacity>
            </View>
            
            
            </View>   
    )

}