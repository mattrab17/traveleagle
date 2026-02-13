Commands: 

  -To install libraries:

  Open terminal and run "npx expo install ..."

  -To run the project

  Open terminal and run "npx expo start"


==========

Expo Router -> a tool used to navigate between different pages. 
            -> When the code runs, it follows a strict folder and file structure
            -> First it finds the app/ folder in your project, and immediately runs the index.jsx/tsx file


File Structure for Expo Router:

├── app/                        # MAIN RUN FOLDER: Contains all app pages and paths.
│   ├── (authentication)/       # CATEGORY: Authentication flow logic.
│   │   ├── login.tsx           # Login page.
│   │   └── register.tsx        # Registration page.
│   │
│   ├── (main_screen)/          # CATEGORY: Main application pages
│   │   ├── _layout.tsx         # Defines shared UI elements (Headers, Tabs) for the main screens.
│   │   └── homepage.tsx        # The main landing page or dashboard inside the app.
│   │
│   ├── api/                    # Folder for API route client logic (calling external backends).
│   ├── _layout.tsx             # ROOT LAYOUT: Shared UI elements (Navigation bars, etc.) for the whole app.
│   └── index.tsx               # ENTRY POINT: First page that loads when you run the project.
│
├── src/                        # MAIN LOGIC FOLDER
│   ├── components/             # Reusable react components/blocks of code used in any page.
│   └── services/               # FOLDER FOR LOGIC: Handles "server-side" style logic.
│       ├── auth.ts             # Authentication logic (handling login tokens/sessions).
│       └── db.ts               # Database helper logic (fetching data from your external DB).
│
├── assets/                     # Contains images and static media.
├── node_modules/               # Contains all repositories and libraries for the project.
├── .gitignore                  # Files and folders to be ignored by Git.
├── app.json                    # Configuration options responsible for building/updating the app.
├── tsconfig.json               # TypeScript rules to enforce type safety throughout the project.
├── package.json                # Project dependencies, scripts, and metadata.
└── PROJECTNOTES.md             # Personal notes and documentation for project development.


==========

Dependencies:

"dependencies": {
    "@expo/vector-icons": "^15.0.3",
    "@react-native-async-storage/async-storage": "2.2.0",
    "@gorhom/bottom-sheet": "^5",
    "@react-navigation/bottom-tabs": "^7.4.0",
    "@react-navigation/elements": "^2.6.3",
    "@react-navigation/native": "^7.1.8",
    "@supabase/supabase-js": "^2.93.3",
    "dom": "^0.0.3",
    "expo": "~54.0.33",
    "expo-constants": "~18.0.13",
    "expo-font": "~14.0.11",
    "expo-haptics": "~15.0.8",
    "expo-image": "~3.0.11",
    "expo-linking": "~8.0.11",
    "expo-router": "~6.0.23",
    "expo-splash-screen": "~31.0.13",
    "expo-status-bar": "~3.0.9",
    "expo-symbols": "~1.0.8",
    "expo-system-ui": "~6.0.9",
    "expo-web-browser": "~15.0.10",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-native": "0.81.5",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-google-places-autocomplete": "^2.6.4",
    "react-native-maps": "1.20.1",
    "react-native-reanimated": "~4.1.1",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "react-native-web": "~0.21.0",
    "react-native-worklets": "0.5.1",
    "react-router": "^7.13.0",
    "react-router-dom": "^7.13.0"
  },