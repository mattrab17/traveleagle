import { Stack, useRootNavigationState, useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";
import { BACKGROUND_COLOR } from "../app/constants/colors";
import { AuthProvider, useAuth } from "./(authentication)/Auth";
import { useEffect } from "react";



function RootNavigatior(){
  const {isLoggedIn, isLoading} = useAuth();
  const router = useRouter();



//Commented Out for testing, uncomment when ready to use app wide auth redirects
 /* useEffect(()=>{
    if (isLoading) return;
    setTimeout(()=> {
    if(isLoggedIn){
      //Will Replace with home screen eventually,
      router.replace('/TripList')
    }
    else{
      router.replace('/(authentication)/LogInScreen')
    } }, 0);
}, [isLoggedIn, isLoading,]);
*/
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
      {/* ROOT BACKGROUND LAYER */}
      <View style={{ flex: 1, backgroundColor: BACKGROUND_COLOR }}>
       <RootNavigatior />
      </View>
    </SafeAreaProvider>
    </AuthProvider>
  );
}
