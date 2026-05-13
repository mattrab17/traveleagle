import { supabase } from "@/lib/supabase";

// loads ratings for the post
async function loadRatings(postId) {
  const { data, error } = await supabase
    .from("ratings")
    .select("*")
    // filters ratings to only those that match the postId
    .eq("post_id", postId);

  // if there is an error loading ratings
  if (error) {
    return { data: null, error };
  }

  // returns rating data if successful
  return { data, error: null };
}

// adds a rating to one specific post
async function addRating(postId, userId, rating) {
  const { data, error } = await supabase
    .from("ratings")
    .insert([
      {
        post_id: postId,
        user_id: userId,
        rating: rating,
      },
    ])
    .select();

  if (error) {
    return { data: null, error };
  }

  // returns inserted rating
  return { data, error: null };
}

// gets average rating for one post
async function getAverageRating(postId) {
  const { data, error } = await supabase
    .from("ratings")
    .select("rating")
    .eq("post_id", postId);

  // if there is an error loading ratings
  if (error) {
    return { average: 0, count: 0, error };
  }

  // if there are no ratings yet
  if (!data || data.length === 0) {
    return { average: 0, count: 0, error: null };
  }

  // adds all ratings together
  const total = data.reduce((sum, row) => sum + row.rating, 0);

  // calculates average
  const average = total / data.length;

  return {
    average,
    count: data.length,
    error: null,
  };
}

// exports functions so other files can use them
export const ratingController = {
  loadRatings,
  addRating,
  getAverageRating,
};
