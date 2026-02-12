import { View, Text, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react"; // a hook library that allows the code to use states. (S0->S1->S2, each state is saved in the code)
import { Session } from '@supabase/supabase-js'
import { supabase } from "@/lib/supabase";


export default function Account({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true)

  const [username, setUsername] = useState('') //default state for username input
  const [email, setEmail] = useState(""); //default state for email input
  const [password, setPassword] = useState("");
  const [avatar_url, setavatar_url] = useState('')
  //code from supabase used to update data in our 'users' table
  useEffect(() => {
    if (session) getUsers()
      }, [session])
   async function getUsers() {
     try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')
      

      const { data, error, status } = await supabase
        .from('users')
        .select(`username, avatar_url`)
        .eq('id', session?.user.id)
        .single()
        if (error && status !== 406) {
          throw error
        }
         if (data) {
          setUsername(data.username)
          setavatar_url(data.avatar_url)
          }
         } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile() {
  
    try {

      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')
       const { error } = await supabase.from('users').upsert({
       id: session.user.id,
       username,
       email,
       avatar: avatar_url

      })
      if (error) throw error
      //these updates supabase's auth info, not the database tables
      await supabase.auth.updateUser({ email })
      
       if (password) {
      await supabase.auth.updateUser({ password })
      setPassword('')
    }
  
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

    </View>
  );
}
