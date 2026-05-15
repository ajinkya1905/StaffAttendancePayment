import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { 
  DEBUG_FORCE_ADS_REMOVED, 
  DEBUG_FORCE_SHOW_ADS,
  AD_UNIT_IDS 
} from '../constants/ads';

const AdContext = createContext();

export function AdProvider({ children }) {
  // Apply debug flag for initial state
  const [adsRemoved, setAdsRemoved] = useState(DEBUG_FORCE_ADS_REMOVED);
  const [isLoading, setIsLoading] = useState(true);
  const [interstitialLoaded, setInterstitialLoaded] = useState(false);
  const interstitialRef = useRef(null);

  // Compute effective ads removed state (respects debug flags)
  const effectiveAdsRemoved = DEBUG_FORCE_SHOW_ADS 
    ? false 
    : (DEBUG_FORCE_ADS_REMOVED || adsRemoved);

  // Initialize interstitial ad
  useEffect(() => {
    const initAds = async () => {
      try {
        // Check local storage for ads removed state
        const storedValue = await AsyncStorage.getItem('@staff_attendance_ads_removed');
        if (storedValue === 'true') {
          setAdsRemoved(true);
        }
      } catch (error) {
        console.log('Error loading ads state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAds();
  }, []);

  // Load interstitial ad
  const loadInterstitial = useCallback(() => {
    if (effectiveAdsRemoved) return;

    try {
      const interstitial = InterstitialAd.createForAdRequest(AD_UNIT_IDS.INTERSTITIAL, {
        requestNonPersonalizedAdsOnly: true,
      });

      interstitial.addAdEventListener(AdEventType.LOADED, () => {
        setInterstitialLoaded(true);
        interstitialRef.current = interstitial;
      });

      interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        setInterstitialLoaded(false);
        // Load next ad
        loadInterstitial();
      });

      interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
        console.log('Interstitial ad error:', error);
        setInterstitialLoaded(false);
      });

      interstitial.load();
    } catch (error) {
      console.log('Error creating interstitial:', error);
    }
  }, [effectiveAdsRemoved]);

  // Load interstitial on mount
  useEffect(() => {
    if (!effectiveAdsRemoved && !isLoading) {
      loadInterstitial();
    }
  }, [effectiveAdsRemoved, isLoading, loadInterstitial]);

  // Show interstitial ad
  const showInterstitial = useCallback(async () => {
    if (effectiveAdsRemoved) return false;
    
    if (interstitialLoaded && interstitialRef.current) {
      try {
        await interstitialRef.current.show();
        return true;
      } catch (error) {
        console.log('Error showing interstitial:', error);
        return false;
      }
    }
    return false;
  }, [effectiveAdsRemoved, interstitialLoaded]);

  // Remove ads (for future IAP implementation)
  const removeAds = useCallback(async () => {
    setAdsRemoved(true);
    await AsyncStorage.setItem('@staff_attendance_ads_removed', 'true');
  }, []);

  const value = {
    adsRemoved: effectiveAdsRemoved,
    isLoading,
    showInterstitial,
    interstitialLoaded,
    loadInterstitial,
    removeAds,
  };

  return (
    <AdContext.Provider value={value}>
      {children}
    </AdContext.Provider>
  );
}

export function useAds() {
  const context = useContext(AdContext);
  if (!context) {
    throw new Error('useAds must be used within an AdProvider');
  }
  return context;
}
