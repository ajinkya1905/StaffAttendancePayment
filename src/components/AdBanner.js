import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { useAds } from '../context/AdContext';
import { AD_UNIT_IDS } from '../constants/ads';

export default function AdBanner({ size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER, style }) {
  const { adsRemoved, isLoading } = useAds();

  // Don't show ads if removed or still loading
  if (adsRemoved || isLoading) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={AD_UNIT_IDS.BANNER}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          console.log('Banner ad loaded');
        }}
        onAdFailedToLoad={(error) => {
          console.log('Banner ad failed to load:', error);
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
});
