// src/hooks/useIsAppMode.js
import { Capacitor } from '@capacitor/core';

export const useIsAppMode = () => {
  return Capacitor.isNativePlatform(); // true on Android/iOS app, false in browser
};