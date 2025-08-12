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
    secondary: '#3870f1ff',
    success: '#d4edda',
    error: '#f8d7da',
    appBackground: '#FFFFFF',
    surface: '#ffffff',
    surfaceSecondary: '#f8f8f8',
    border: '#e0e0e0',
    accent: '#ee7e07ff',
    textSecondary: '#6c757d',
  },
  dark: {
    text: '#f0f0f0',
    background: '#5d5b5bff',
    tint: tintColorDark,
    icon: '#f0f0f0',
    tabIconDefault: '#cccccc',
    tabIconSelected: tintColorDark,
    secondary: '#3870f1ff',
    success: '#1e3a24',
    error: '#d13844ff',
    appBackground: '#000000',
    surface: '#1c1c1e',
    surfaceSecondary: '#2c2c2e',
    border: '#3a3a3c',
    accent: '#ee7e07ff',
    textSecondary: '#8e8e93',
  },
};
