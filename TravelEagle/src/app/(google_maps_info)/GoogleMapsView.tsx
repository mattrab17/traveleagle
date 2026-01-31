import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import { Marker } from 'react-native-maps';
import { Text, View } from 'react-native';

export default function GoogleMapsView(){

/* Template for daily itinerary --> Map view with Markers
    Gets list of places from db, [id, lat,long, etc..]
    pushes them to the placaes array, then array is mapped and renedered into MapView logic
    */

const places = [
  {id: 1, name: 'Times Square', lat: 40.7580, long: -73.9855, emoji:'🏙️'},
  {id: 2, name: 'Central Park', lat: 40.7826, long: -73.9656, emoji:'🌳'}

]

return (

<MapView

provider={PROVIDER_GOOGLE}
initialRegion={{
   latitude: 40.77892,
    longitude: -73.968360,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
}
}
style = {{flex: 1}}>
    
    {/* basic marker */}
    <Marker
            coordinate={{latitude: 40.77892, longitude: -73.968360}}
            title='Turtle Pond'
>
  <View style ={{
    /* Need to make a fixed size when zooming and zooming out later */
    width:27,
    height:27,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  }
  }
  >
  <Text>🐢</Text>
  </View>
</Marker>

{places.map((place) => (
<Marker
            coordinate={{latitude: place.lat, longitude: place.long}}
            title={place.name}
            key = {place.id}
>
  <View style ={{
    /* Need to make a fixed size when zooming and zooming out later */
    width:27,
    height:27,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  }
  }
  >
  <Text>{place.emoji}</Text>
  </View>
</Marker>
))}


</MapView>

);

}




//