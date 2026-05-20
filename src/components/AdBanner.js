import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { useAds } from '../context/AdContext';
import { AD_UNIT_IDS } from '../constants/ads';

export default function AdBanner({ size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER, style }) {
  const { adsRemoved, isLoading } = useAds();
  const [adError, setAdError] = useState(null);

  // Don't show ads if removed or still loading
  if (adsRemoved || isLoading) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {adError && __DEV__ && (
        <Text style={styles.errorText}>Ad Error: {adError}</Text>
      )}
      <BannerAd
        unitId={AD_UNIT_IDS.BANNER}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          console.log('Banner ad loaded');
          setAdError(null);
        }}
        onAdFailedToLoad={(error) => {
          console.log('Banner ad failed to load:', error);
          setAdError(error.message);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  errorText: {
    color: 'red',
    fontSize: 10,
    padding: 4,
  },
});
