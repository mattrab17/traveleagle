import React, { useEffect, useState } from 'react'
import * as Location from 'expo-location'//library provides access to geolocation information

const useLocation = () => {
    //use state will allow values to change with human movement
    const [errorMsg, setErrorMsg] = useState(null);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [address, setAddress] = useState(null)//for when user wants to post, dont have to type out address


    const getUserLocation = async () => {//will ask user for permission to retrieve their location
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status != 'granted') {
            setErrorMsg('Permission to use your location was not granted')
            return;
        }

        let { coords } = await Location.getCurrentPositionAsync();//gets location of user and set
        if (coords) {
            const { latitude, longitude } = coords
            

            setLatitude(latitude)
            setLongitude(longitude)

            

            //this will return the location in a proper address, not coordinate points
            let address = await Location.reverseGeocodeAsync({
                 latitude: latitude,
                longitude:longitude
            })

            /*the expo reverse geolocation works by sending an array of the closest matching adresses
          to the coordinate points this will choose the first candidate*/
            if (result && result.length > 0) {
            const place = result[0];
        }
            //this will return the address in a format acceptable by the google maps platform
             const formattedAddress =  [
                //prevents comma after the number from appearing
                place.streetNumber + " " + place.street,
                place.city,
                place.region,
                place.postalCode,
                place.country,
            ].filter(Boolean).join(", ")
            setAddress(formattedAddress)
        }
    }
        useEffect(() => {
            getUserLocation()
        }, [])
    
        
    
    return {latitude, longitude, errorMsg,address}
}

export default useLocation
