# Workout Tracker

A comprehensive mobile application for tracking workouts, food intake, and body measurements, built with React Native and Expo.

## ✨ Key Features

- **User Authentication:** Secure user login and profile management.
- **Workout & Routine Management:**
  - Create, view, and manage custom workout routines.
  - Add custom exercises with details.
  - Log workout sessions in real-time, tracking sets, reps, and weight.
- **Food Logging:**
  - Log daily food intake for different meal types (Breakfast, Lunch, Dinner, Snacks).
  - Use a barcode scanner for quick and easy food entry.
  - Manually enter food product details.
- **Measurement Tracking:**
  - Record and monitor personal body measurements like weight, height, and age.
- **History & Progress:**
  - View detailed summaries of completed workouts.
  - Track progress over time through logs.

## 🛠️ Tech Stack

- **Framework:** [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Navigation:** [Expo Router](https://docs.expo.dev/router/introduction/)
- **Backend & Database:** [Supabase](https://supabase.com/)
- **Styling:** Standard React Native stylesheets and custom components.

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- Git

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd workouttracker
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    This project requires a Supabase backend. You will need to have your own Supabase project and configure the URL and public key. These are managed in `app.json` under the `extra` field.

4.  **Run the application:**
    ```bash
    npx expo start
    ```
    This will open the Expo development server. You can then run the app on an Android emulator, iOS simulator, or on your physical device using the Expo Go app.

## 📂 Project Structure

```
.
├── app/            # All screens, layouts, and navigation logic (Expo Router)
├── assets/         # Static assets like images and fonts
├── components/     # Reusable UI components
├── constants/      # Static configuration like color schemes
├── context/        # React Context providers for global state management
├── hooks/          # Custom React hooks
├── supabase/       # Supabase configuration and database migrations
└── utils/          # Utility functions and helpers
```

## 🔧 Configuration

The primary application configuration is managed in `app.json`. This file includes settings for the app name, version, splash screen, icons, and plugins.

eas build --platform android --profile production