import {Calendar, toDateId, useDateRange, CalendarTheme} from "@marceloterreiro/flash-calendar"

import { View, Text, TouchableOpacity } from "react-native";
import {GooglePlacesInputTrip} from "../(google_maps_info)/GooglePlacesAutocomplete";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import { useState } from "react";
import { tripQueries } from "@/models/trips";
import { tripController, goToPreviousMonth, goToNextMonth } from "@/controllers/tripController";
import {
  BACKGROUND_COLOR,
  ORANGE_COLOR,
  SECONDARY_BACKGROUND_COLOR,
  WHITE_TEXT_COLOR,
} from "../constants/colors";
import { validateTripForm } from "../utils/validation";

export default function TripForm({onClose, userId}) {

    const [destination, setDestination] = useState('')
    const { calendarActiveDateRanges, onCalendarDayPress, dateRange, onClearDateRange} = useDateRange();

    const today = toDateId(new Date()); 
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const currentMonthTitle = currentMonth.toLocaleDateString('default', {month: 'long', year: 'numeric'});
    const monthID = toDateId(currentMonth);

  async function handleCreate(){
  try {
    if(!validateTripForm(destination, dateRange.startId, dateRange.endId)){
        return;
    }
    const data = await tripQueries.create({
      /* user_id: 'bde439b9-f312-45af-81b2-f07e1ee74648', */
      user_id: userId,
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
        <ScrollView
          style={{ flex: 1, backgroundColor: SECONDARY_BACKGROUND_COLOR }}
          contentContainerStyle={{ padding: 10, paddingBottom: 80 }}
        >
            <Text style={{ fontSize: 22, color: ORANGE_COLOR, fontWeight:'800',}}>Add a Trip</Text>
            <Text style={{ fontSize:14, color: WHITE_TEXT_COLOR, paddingVertical: 20, fontWeight:'400'
             }}>Plan out your new trip by building an Itinerary</Text>
            {/* Destination Box/Input */}
            <Text style={{fontSize: 16, marginBottom: 10, fontWeight: '500', color: ORANGE_COLOR}}>Destination</Text>
            <View style={{flex:1, width:'100%', marginBottom: 20, zIndex:1 }}>
                <GooglePlacesInputTrip 
                onSelect={(data) => setDestination(data.description)}
                placeholder="Where would you like to go?"
                >
                </GooglePlacesInputTrip>
            </View>

            <Text style={{ fontSize: 16, paddingBottom: 20, fontWeight: '500', color: ORANGE_COLOR}}>Select Dates</Text>
            <View style={{flex:1}}>
                {/* Add borders or a symbol to make the buttons better for user experience*/}
                {/* Also might need to add a drop down menu, to navigate to further months easier*/}
             <View style={{
                    flex: 1,
                    padding: 10,
                    borderRadius:10,
                    borderWidth:1,
                    borderColor: "#4c5158",
                    backgroundColor: BACKGROUND_COLOR,
                }}>
            <View style={{flexDirection: "row", paddingBottom:12, justifyContent: 'space-between' }}>
                <TouchableOpacity onPress={() => setCurrentMonth(goToPreviousMonth(currentMonth))}>
                <Text style={{fontSize: 12, color: "#96a0ad"}}>Previous</Text>
                </TouchableOpacity>
                <Text style={{fontSize:14, fontWeight: 'bold', color: ORANGE_COLOR}}>{currentMonthTitle}</Text>
                <TouchableOpacity onPress={() => setCurrentMonth(goToNextMonth(currentMonth))}>
                <Text style={{fontSize: 12, color: "#96a0ad"}}>Next</Text>
                </TouchableOpacity>
            </View>
            
            <Calendar
                calendarMonthId={monthID}
                calendarActiveDateRanges={calendarActiveDateRanges}
                calendarMinDateId={today}
                onCalendarDayPress={onCalendarDayPress}   
                calendarMonthHeaderHeight={0}
                theme={{
                    itemWeekName:{
                        content: {color: ORANGE_COLOR}
                    },
                    itemDayContainer: {
                      activeDayFiller: { backgroundColor: "#1a2f4e" },
                    },
                    itemDay: {
                      base: () => ({
                        content: { color: WHITE_TEXT_COLOR },
                      }),
                      idle: () => ({
                        container: { backgroundColor: "transparent" },
                        content: { color: WHITE_TEXT_COLOR },
                      }),
                      today: () => ({
                        container: {
                          backgroundColor: "transparent",
                          borderColor: ORANGE_COLOR,
                          borderWidth: 1,
                        },
                        content: { color: WHITE_TEXT_COLOR, fontWeight: "700" },
                      }),
                      active: () => ({
                        container: { backgroundColor: ORANGE_COLOR },
                        content: { color: BACKGROUND_COLOR, fontWeight: "700" },
                      }),
                      disabled: () => ({
                        container: { backgroundColor: "transparent" },
                        content: { color: "#667085" },
                      }),
                    },
                }}
                           
            /></View></View>
            <View style={{marginTop: 15, flexDirection: "row", gap:10}}>
                <View style={{
                    flex: 1,
                    padding: 10,
                    borderRadius:10,
                    borderWidth:1,
                    borderColor: "#4c5158",
                    backgroundColor: BACKGROUND_COLOR,
                }}>
                <Text style={{fontSize:12, color: ORANGE_COLOR, }}>
                    Start
                </Text>
                <Text style={{fontSize: 14, fontWeight: '500', color: WHITE_TEXT_COLOR, marginTop: 10}}>
                    {dateRange.startId || 'Select a Starting Date'}
                </Text>
                </View>

                <View style={{
                    flex: 1,
                    padding: 10,
                    borderRadius:10,
                    borderWidth:1,
                    borderColor: "#4c5158",
                    backgroundColor: BACKGROUND_COLOR,
                }}>
                <Text style={{fontSize:12, color: ORANGE_COLOR, }}>
                    End
                </Text>
                <Text style={{fontSize: 14, fontWeight: '500', color: WHITE_TEXT_COLOR, marginTop: 10 }}>
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
                backgroundColor: "#2c4eb5",
                borderRadius:10,
                marginTop: 3,
                width: '30%',
                alignContent: 'center',
                alignItems: 'center'
            }}
            onPress={handleCreate}
            >
                <Text style={{ color: WHITE_TEXT_COLOR, fontWeight: "700" }}>Create Trip</Text>
            </TouchableOpacity>
            </View>
             
            
        </ScrollView>   
    )

}

