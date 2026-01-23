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

