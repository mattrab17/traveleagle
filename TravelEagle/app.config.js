export default {
  "expo": {
    "name": "TravelEagle",
    "slug": "TravelEagle",
    "version": "1.0.0",
    "scheme": "traveleagle",
    "orientation": "portrait",
    "icon": "./assets/images/traveleaglelogo.png",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,

"bundleIdentifier": "com.traveleagle.app", 
"config": 
{"googleMapsApiKey": process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
 } 
},
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
      },
      "edgeToEdgeEnabled": true,
      "predictiveBackGestureEnabled": false
    },
    "web": {
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff",
          "dark": {
            "backgroundColor": "#000000"
          }
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true,
      "reactCompiler": true
    }
  }
};
