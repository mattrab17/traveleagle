import { Text, View } from "react-native"; 

//Text = built-in react native component for inserting text (Same as <p> </p> in HTML)
//View = built-in react native component for containing components like "Text" (Same as <div> </div> in HTML)

export default function Index() { //exports the index page so that it can be used in the app
  return ( //return any 
    <View
      style={{ //this centers everything inside of the View container
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{color: "green"}}>Hello!</Text> 
    </View>
  );
}
