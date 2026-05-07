import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { View, Text, TextInput, Pressable, Alert, Switch, StyleSheet, ScrollView } from "react-native";

import useLocation from "@/LocationServices/liveLocation";

import CameraRoll from "@/cameraRoll/PhotoLibraryAccess";
  
export default function UserPostsPage() {
  const [userId, setUserId] = useState("")//stores userId so can see in database which user posted
  const [placeName, setPlaceName] = useState("")//stores place name user creates
  const [address, setAddress] = useState("")//stores address either placed by user or by reverse geolocation
  const [description, setDescription] = useState("")
  const [postLat, setPostLat] = useState("")//stores latitude, user cannot enter these can only be entered by geolocation
  const [postLong, setPostLong] = useState("")//stores longitude, user cannot enter these can only be entered by geolocation
  const [category, setCategory] = useState([])
  const [imageUrl, setImageUrl] = useState("")

  //if user chooses to use currentlocation, will autofill address, PostLat and PostLong sections 
  const [useCurrentLocation, setUseCurrentLocation] = useState(true)

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

    const toggleCategory = (selectedCategory) => {
  if (category.includes(selectedCategory)) {
    setCategory(category.filter((item) => item !== selectedCategory));
  } else {
    setCategory([...category, selectedCategory]);
  }
};
  
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
          category: category.length > 0 ? category : null,
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
      setCategory([]);
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
  //for the toggling of the post category,

  const postFilterOptions = [
  "Restaurants",
  "General Attractions",
  "Coffee",
  "Bars",
];
 return (
  <View style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.headerTitle}>Create a Post</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Place Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Place name"
          placeholderTextColor="#9DB4D8"
          value={placeName}
          onChangeText={setPlaceName}
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          placeholder="279 Bedford Ave, Brooklyn, NY 11211, USA"
          placeholderTextColor="#9DB4D8"
          value={address}
          onChangeText={setAddress}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          placeholder="Description"
          placeholderTextColor="#9DB4D8"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <CameraRoll onImageSelected={setImageUrl} />
        

        <Text style={styles.label}>Categories</Text>

<View style={styles.filtersWrap}>
  {postFilterOptions.map((option) => {
    const selected = category.includes(option);

    return (
      <Pressable
        key={option}
        style={[
          styles.filterOptionBtn,
          selected && styles.filterOptionBtnSelected,
        ]}
        onPress={() => toggleCategory(option)}
      >
        <Text
          style={[
            styles.filterOptionText,
            selected && styles.filterOptionTextSelected,
          ]}
        >
          {option}
        </Text>
      </Pressable>
    );
  })}
</View>

        <Pressable
          style={styles.createButton}
          onPress={createPost}
        >
          <Text style={styles.createButtonText}>
            Create Post
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  </View>
);
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#071A33",
  },

  page: {
    flexGrow: 1,
    backgroundColor: "#0B2344",
    paddingHorizontal: 12,
    paddingTop: 72,
    paddingBottom: 30,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "700",
    marginBottom: 14,
  },

  card: {
    backgroundColor: "#0f2c58",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1d4174",
    padding: 14,
  },

  label: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#355782",
    backgroundColor: "#18365d",
    color: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    fontSize: 15,
  },

  descriptionInput: {
    minHeight: 90,
    textAlignVertical: "top",
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  locationBox: {
    backgroundColor: "#18365d",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2b517f",
    padding: 10,
    marginBottom: 14,
  },

  infoText: {
    color: "#9DB4D8",
    fontSize: 14,
    marginBottom: 4,
  },

  errorText: {
    color: "#ff6b6b",
    fontSize: 14,
  },

  createButton: {
    backgroundColor: "#3858D6",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 4,
  },
  filtersWrap: {
  flexDirection: "row",
  flexWrap: "wrap",
  marginTop: 10,
  marginBottom: 14,
},

filterOptionBtn: {
  paddingVertical: 10,
  paddingHorizontal: 14,
  borderRadius: 20,
  backgroundColor: "#1c3252",
  marginRight: 10,
  marginBottom: 10,
},

filterOptionBtnSelected: {
  backgroundColor: "#3858D6",
},

filterOptionText: {
  color: "white",
  fontSize: 14,
},

filterOptionTextSelected: {
  fontWeight: "700",
},
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
