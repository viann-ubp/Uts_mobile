import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'com.your.app',
  appName: 'PomodoroKu',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000, // Tampilkan splash selama 3 detik
      launchAutoHide: true,
      backgroundColor: "#020617", // Samakan dengan $bg-dark kamu!
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
  },
};