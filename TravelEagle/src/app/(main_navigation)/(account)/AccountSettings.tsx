import { View, Text, TextInput, Pressable } from "react-native";
import { router, useRouter } from "expo-router";
import { useState } from "react"; // a hook library that allows the code to use states. (S0->S1->S2, each state is saved in the code)

export default function AccountSettings() {
  const [username, setUsername] = useState("johndoe02"); //default state for username input
  const [email, setEmail] = useState("johndoe02@gmail.com"); //default state for email input
  const [password, setPassword] = useState("password123"); //default state for password input 

  return (
    <View style={{
        flex: 1,
        backgroundColor: "#050E2D",
        justifyContent: "center",
        alignItems: "center",
    }}>
      
      {/* Username */}
      <Text style={{color: "white", fontSize: 30}}>Username:</Text>
      <View style={{ backgroundColor: "#1E293B", width: "80%", padding: 10, marginVertical: 10 }}>
        <TextInput 
          style={{ color: "white", fontSize: 25 }}
          value={username}
          onChangeText={setUsername} //when username changed, set to new value
          onSubmitEditing={() => {}} // when edit is complete, do an action
        />
      </View>

      {/* Email Address */}
      <Text style={{ color: "white", fontSize: 30 }}>Email address:</Text>
      <View style={{ backgroundColor: "#1E293B", width: "80%", padding: 10, marginVertical: 10 }}>
        <TextInput 
          style={{ color: "white", fontSize: 25 }}
          value={email}
          onChangeText={setEmail} //when email address is changed, set to new value
          onSubmitEditing={() => {}} //when edit is complete, do an action
        />
      </View>

      {/* Password */}
      <Text style={{ color: "white", fontSize: 30 }}>Password:</Text>
      <View style={{ backgroundColor: "#1E293B", width: "80%", padding: 10, marginVertical: 10 }}>
        <TextInput 
          style={{ color: "white", fontSize: 25 }}
          value={password}
          onChangeText={setPassword} //when password is changed, set to new value
          secureTextEntry={true} //hide password while typing
          onSubmitEditing={() => {}}  //when edit is complete, do an action 
        />
      </View>

      {/* Sign Out Button */}
      <Pressable 
        onPress={() => router.replace("/")}
        style={{ marginTop: 40 }}
      >
        <Text style={{ color: "#FF4444", fontSize: 25, fontWeight: "bold" }}>
          Sign Out
        </Text>
      </Pressable>
    </View>
  );
}