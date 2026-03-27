import React, { useEffect, useState } from 'react'
import * as Location from 'expo-location'//library provides access to geolocation information

const useLocation = () => {
    //use state will allow values to change with human movement
    const [errorMsg, setErrorMsg] = useState(null);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);



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
                latitude, longitude
            })
        
        }
    }
        useEffect(() => {
            getUserLocation()
        }, [])
    
        
    
    return {latitude, longitude, errorMsg}
}

export default useLocation
