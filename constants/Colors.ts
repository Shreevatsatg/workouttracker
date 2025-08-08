/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#000000';
const tintColorDark = '#f0f0f0';

export const Colors = {
  light: {
    text: '#000000',
    background: '#f0f0f0',
    tint: tintColorLight,
    icon: '#000000',
    tabIconDefault: '#cccccc',
    tabIconSelected: tintColorLight,
        secondary: '#ee7e07ff',
    success: '#d4edda', // A light green for success
    error: '#f8d7da', // A light red for error
    appBackground: '#F8FAFC', // Minimal light background
  },
  dark: {
    text: '#f0f0f0',
    background: '#000000',
    tint: tintColorDark,
    icon: '#f0f0f0',
    tabIconDefault: '#cccccc',
    tabIconSelected: tintColorDark,
    secondary: '#ee7e07ff',
    success: '#1e3a24', // A dark green for success
    error: '#d13844ff', // A dark red for error
    appBackground: '#0F172A', // Minimal dark background
  },
};
