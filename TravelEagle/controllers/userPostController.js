import { supabase } from "@/lib/supabase";
import { useEffect, useState } from 'react'

//loads latitude and longitude of searched place, and selected categories of user
async function loadPosts(lat, lng, categories = []){
    //selects all columns in table
    let query = supabase.from("user_posts").select("*")
    //filters out the unselected categores from the database table
     if (categories.length > 0) {
    query = query.in("category", categories);
  }
    //sends request to database
    const { data, error } = await query;
    //if there is an error, no data returns and error is displayed
    if (error) {
    return { data: null, error };
  }
  //filter method creates a new array from the current one 
  const nearbyPosts = (data || []).filter((post) => {
    const latRadius = Math.abs(post.post_lat - lat)
    const lngRadius = Math.abs(post.post_long - lng)
      //this number SHOULD be about 2000 ft
      return latRadius < 0.0055 && lngRadius < 0.0055
  });
 
   return { data: nearbyPosts, error: null }
}

export const userPostController = {
  loadPosts
}



