import { Stack, useRootNavigationState, useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Image} from "react-native";
import { BACKGROUND_COLOR } from "../app/constants/colors";
import { AuthProvider, useAuth } from "./(authentication)/Auth";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";



function RootNavigatior(){
  const {isLoggedIn, isLoading, user} = useAuth();
  const router = useRouter();



//Commented Out for testing, uncomment when ready to use app wide auth redirects
 useEffect(()=>{
    if (isLoading) return;
    setTimeout(()=> {
    if(!isLoggedIn){
      router.replace('/WelcomePage')
    } else if (!user?.interests || user.interests.length === 0 || !user?.pace){
      router.replace('/components/Onboarding')
    }
    else{
      router.replace('/HomeScreen')
    } }, 0);
}, [isLoggedIn, isLoading, user]);

/* if(isLoading){
  return(
    <View style={{flex:1, backgroundColor: BACKGROUND_COLOR, justifyContent: 'center', alignItems: 'center'}}>
      <Image
      source={require("../../assets/images/traveleaglelogo.png")}
      style={{width: 100, height: 100}}>


      </Image>
    </View>
  )
} */
  return (
    <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: BACKGROUND_COLOR,
            },
          }}
        />
  )
  
}
export default function RootLayout() {
  return (
    <AuthProvider>
    <SafeAreaProvider>
      <GestureHandlerRootView>
      {/* ROOT BACKGROUND LAYER */}
      <View style={{ flex: 1, backgroundColor: BACKGROUND_COLOR }}>
       <RootNavigatior />
      </View>
      </GestureHandlerRootView>
    </SafeAreaProvider>
    </AuthProvider>
  );
}