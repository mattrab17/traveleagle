import { supabase } from "@/lib/supabase";

// load nearby events
async function loadEvents(lat, lng, categories = []) {
  let query = supabase.from("CommunityEvents").select("*");

  if (categories.length > 0) {
    query = query.in("event_category", categories);
  }
   //sends request to database
  const { data, error } = await query;

  if (error) {
    return { data: null, error };
  }
  //filter method creates a new array from the current one 
  const nearbyEvents = (data || []).filter((event) => {
    if (event.event_lat == null || event.event_lng == null) {
      return false;
    }

    const latRadius = Math.abs(event.event_lat - lat);
    const lngRadius = Math.abs(event.event_lng - lng);

   //filters out events that are more than about 2000 ft away from the searched location, based on latitude and longitude
    return latRadius < 0.0055 && lngRadius < 0.0055;
  });

  return { data: nearbyEvents, error: null };
}

// create event
async function createEvent(event) {
  const { data, error } = await supabase
    .from("CommunityEvents")
    .insert([
      {
        event_name: event.event_name,
        event_address: event.event_address,
        event_lat: event.event_lat ?? null,
        event_lng: event.event_lng ?? null,
        event_description: event.event_description,
        event_category: event.event_category,
        event_date: event.event_date ?? null,
        num_attending: event.num_attending ?? 1,
        created_by: event.created_by ?? null,
      },
    ])
    .select();

  return { data, error };
}

export const communityEventController = {
  loadEvents,
  createEvent,
};
