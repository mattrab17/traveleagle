import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { View, Text, TextInput, Pressable, Alert, Switch } from "react-native";

import useLocation from "@/LocationServices/liveLocation";

export default function UserPostsPage() {
  const [userId, setUserId] = useState("")//stores userId so can see in database which user posted
  const [placeName, setPlaceName] = useState("")//stores place name user creates
  const [address, setAddress] = useState("")//stores address either placed by user or by reverse geolocation
  const [description, setDescription] = useState("")
  const [postLat, setPostLat] = useState("")//stores latitude, user cannot enter these can only be entered by geolocation
  const [postLong, setPostLong] = useState("")//stores longitude, user cannot enter these can only be entered by geolocation
  const [category, setCategory] = useState("")
  const [imageUrl, setImageUrl] = useState("")

  //if user chooses to use currentlocation, will autofill address, PostLat and PostLong sections 
  const [useCurrentLocation, setUseCurrentLocation] = useState(false)

  const { latitude, longitude, errorMsg, address: currentAddress } = useLocation()

  const getUser = async () => {
    try {
      //gets the users info
      const {data: {user}} = await supabase.auth.getUser()
      //if a user is logged in, it stores their id
      if (user) {setUserId(user.id)} 
    } catch (error) {
      console.log(error)
      setUserId("")
    }
  }

  const createPost = async () => {
    //place must have a name before being posted
    if (placeName.trim() === "") {
      Alert.alert("Please enter the location's name");
      return;
    }
    if (address.trim() === "") {
      Alert.alert("Please enter address, you may use your current location if needed");
      return;
    }
    /*coordinates start out as an empty string
    when doing the GET should look at coords first then address*/
    let finalLat = postLat;
    let finalLong = postLong;
    //if user choose to use current location but location fails
    if (useCurrentLocation) {
      if (latitude == null || longitude == null) {
        Alert.alert("Could not fetch user location");
        return;
      }

      finalLat = latitude
      finalLong = longitude
    }

    const { data, error } = await supabase
      .from("user_posts")
       //insets a row into the supabase table
      .insert([
        {
          place_name: placeName,
          address: address,
          description: description || null,
          post_lat: parseFloat(finalLat) ||null, //parse ensures that the coords are numbers
          post_long: parseFloat(finalLong) || null,
          created_by: userId,
          image_url: imageUrl || null,
          category: category || null,
        },
      ]).select()//returns row that was selected
    
    if (error) {
      console.log(error);
      //if there is an error, it will tell the user to recheck post info
      Alert.alert("Failed to creaate post, reassess post details");
    } else {
      Alert.alert("Post created");
      //once post is created, text boxes are reset
      setPlaceName("");
      setAddress("");
      setDescription("");
      setPostLat("");
      setPostLong("");
      setImageUrl("");
      setCategory("");
      setUseCurrentLocation(false);
    }
  };
  //runs get user function one time when the page is loaded
  useEffect(() => {
    getUser();
  }, []);
  //runs when user toggles the use location button
  useEffect(() => {
    if (useCurrentLocation && currentAddress) {
      setAddress(currentAddress);
    }
  }, [useCurrentLocation, currentAddress]);
  //styling just a placeholder for now, will change later
 return (
  <View style={{ padding: 20, backgroundColor: "#000", flex: 1 }}>
    <Text style={{ fontSize: 24, marginBottom: 20, color: "#fff" }}>
      Create a Post
    </Text>

    <TextInput
      style={{
        borderWidth: 1,
        marginBottom: 12,
        padding: 10,
        color: "#fff",
        borderColor: "#fff",
      }}
      placeholder="Place name"
      placeholderTextColor="#aaa"
      value={placeName}
      onChangeText={setPlaceName}
    />

    <TextInput
      style={{
        borderWidth: 1,
        marginBottom: 12,
        padding: 10,
        color: "#fff",
        borderColor: "#fff",
      }}
      placeholder="279 Bedford Ave, Brooklyn, NY 11211, USA"
      placeholderTextColor="#aaa"
      value={address}
      onChangeText={setAddress}
    />

    <TextInput
      style={{
        borderWidth: 1,
        marginBottom: 12,
        padding: 10,
        color: "#fff",
        borderColor: "#fff",
      }}
      placeholder="Description"
      placeholderTextColor="#aaa"
      value={description}
      onChangeText={setDescription}
    />

    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: "#fff" }}>Use current location</Text>
      <Switch
        value={useCurrentLocation}
        onValueChange={setUseCurrentLocation}
      />
    </View>

    {useCurrentLocation && (
      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: "#fff" }}>
          Latitude: {latitude != null ? latitude : "Loading..."}
        </Text>
        <Text style={{ color: "#fff" }}>
          Longitude: {longitude != null ? longitude : "Loading..."}
        </Text>
        {errorMsg ? <Text style={{ color: "red" }}>{errorMsg}</Text> : null}
      </View>
    )}

    <TextInput
      style={{
        borderWidth: 1,
        marginBottom: 12,
        padding: 10,
        color: "#fff",
        borderColor: "#fff",
      }}
      placeholder="Image URL"
      placeholderTextColor="#aaa"
      value={imageUrl}
      onChangeText={setImageUrl}
    />

    <TextInput
      style={{
        borderWidth: 1,
        marginBottom: 12,
        padding: 10,
        color: "#fff",
        borderColor: "#fff",
      }}
      placeholder="Category"
      placeholderTextColor="#aaa"
      value={category}
      onChangeText={setCategory}
    />

    <Pressable
      style={{
        borderWidth: 1,
        padding: 12,
        alignItems: "center",
        borderColor: "#fff",
      }}
      onPress={createPost}
    >
      <Text style={{ color: "#fff" }}>Create Post</Text>
    </Pressable>
  </View>
)}
