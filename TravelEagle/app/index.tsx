import { Text, View, Button} from "react-native";
import GoogleMapsView from "./GoogleMapsView";
import { router } from "expo-router";
//Text = built-in react native component for inserting text (Same as <p> </p> in HTML)
//View = built-in react native component for containing components like "Text" (Same as <div> </div> in HTML)
export default function Index() { //exports the index page so that it can be used in the app//return any 
    
return (

<View style = {{flex: 1,
       justifyContent: "center",
        alignItems: "center"
}}>
<Text style={{color: "green"}}>Hello!</Text>
<Button title = "Open Map"
onPress={() => router.push('/GoogleMapsView')}
/>

</View>

);
}
