

import {
  GoogleGenAI,
  Type,
} from '@google/genai';

  const ai = new GoogleGenAI({
    apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY
  });
  const config = {
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      required: ["itinerary"],
      properties: {
        itinerary: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["day_number", "date", "title", "activities"],
            properties: {
              day_number: {
                type: Type.INTEGER,
                description: "Which day of the trip (1, 2, 3...)",
              },
              date: {
                type: Type.STRING,
                description: "Date in YYYY-MM-DD format",
              },
              title: {
                type: Type.STRING,
                description: "Short day title, max 5 words",
              },
              activities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  required: ["order_index", "place_name", "place_address", "category", "start_time", "end_time", "notes"],
                  properties: {
                    order_index: {
                      type: Type.INTEGER,
                      description: "Order of this activity in the day (1, 2, 3...)",
                    },
                    place_name: {
                      type: Type.STRING,
                      description: "Official place name as it appears on Google Maps",
                    },
                    place_address: {
                      type: Type.STRING,
                      description: "Full street address",
                    },
                    category: {
                      type: Type.STRING,
                      description: "One of: restaurant, attraction, museum, park, shopping, nightlife, cafe, hotel",
                    },
                    start_time: {
                      type: Type.STRING,
                      description: "Start time in HH:MM 24-hour format",
                    },
                    end_time: {
                      type: Type.STRING,
                      description: "End time in HH:MM 24-hour format",
                    },
                    notes: {
                      type: Type.STRING,
                      description: "1-2 sentence tip for the traveler",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    systemInstruction: [
        {
          text: `You are a travel itineary planner for the Travel Eagle App.
                Rules: 
                1. Every place MUST be a real place, MUST be currently operating establishment or attraction.
                2. Each activity must be a specific, searchable place name; no generic descriptions like "a local coffee shop."
                3. Never suggest the same place twice across the entire trip.
                4. Leave 30-60 minute gaps between activities for travel time.
                5. Mix well-known landmarks with local hidden gems.
                `,
      }
  ],
  };
const model = 'gemini-3-flash-preview';

function buildUserPrompt(trip, numDays, interests): string{


  const pace = trip.pace ? trip.pace : 'Moderate: (3-4) Activities Per Day'
  const interestsString = trip.interests?.length ? trip.interests.join(", ") : "sightseeing, hiking, food, culture, landmarks, architecture";
  
  return `
            Plan a ${numDays} day trip to ${trip.destination}

            TRIP DETAILS:
            -Dates: ${trip.start_date} & ${trip.end_date}
            -Interests: ${interestsString}
            -Pace: ${pace}

            Generate exactly ${numDays} days with the approximate nunber of activities based on the given pace.

            `
}

export async function generateItineraryFromGemini(trip: any, numDays, interests): Promise<any>{
    
    const userPrompt = buildUserPrompt(trip, numDays, interests);

    try{
      const response = await ai.models.generateContent({
        model: model,
        config, 
        contents: [
          {
            role: "user",
            parts: [{text: userPrompt}],
          },
        ],
      }
      );
      const text = response.text;
      if (!text) throw new Error("No response generated.");
      const parsed = JSON.parse(text);

      return parsed;
    }
    catch (error) {
      console.error("Error:", error);
      throw error;
    }
  
}

const discoveryConfig = {
  responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      required: ["suggestions"],
      properties: {
        suggestions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["place_name", "place_address", "category", "notes"],
            properties: {
                    place_name: {
                      type: Type.STRING,
                      description: "Official place name as it appears on Google Maps",
                    },
                    place_address: {
                      type: Type.STRING,
                      description: "Full street address",
                    },
                    category: {
                      type: Type.STRING,
                      description: "One of: restaurant, attraction, museum, park, shopping, nightlife, cafe, hotel",
                    },
                    notes: {
                      type: Type.STRING,
                      description: "1-2 sentence tip for the traveler",
                    },
                  },
                },
              },
            },
          },
    systemInstruction: [
        {
          text: `You are a place discovery assistant for the Travel Eagle App.
                Rules: 
                1. Every place MUST be a real place, MUST be currently operating establishment or attraction.
                2. Each activity must be a specific, searchable place name; no generic descriptions like "a local coffee shop."
                3. Never suggest the same place twice.
                4. Return exactly 5 suggestions.
                5. Mix well-known landmarks with local hidden gems.
                6. Only suggest places relevant to the user's query.
                7. Include places in nearby areas, not just within the exact city limits. For example, if the destination is "New York City", also consider places in Long Island and New Jersey that are within reasonable travel distance.
                `,
      }
  ],
};




export async function generateDiscoverySuggestionsGemini(query, destination){

    try{
      const response = await ai.models.generateContent({
        model: model,
        config: discoveryConfig, 
        contents: [
          {
            role: "user",
            parts: [{text: `${query} in ${destination}`}],
          },
        ],
      }
      );
      const text = response.text;
      if (!text) throw new Error("No response generated.");
      const parsed = JSON.parse(text);
      return parsed;
    }
    catch (error) {
      console.error("Error:", error);
      throw error;
    }
}
