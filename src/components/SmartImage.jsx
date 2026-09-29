import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme';

/** Rasm yuklanmasa yoki internet bo'lmasa brend gradientini ko'rsatadi. */
export default function SmartImage({ uri, style, icon = 'run-fast', iconSize = 40, children, fade = false }) {
  const [failed, setFailed] = useState(false);

  return (
    <View style={[styles.base, style]}>
      {!failed && uri ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" onError={() => setFailed(true)} />
      ) : (
        <LinearGradient colors={['#5CACFF', colors.primary]} style={[StyleSheet.absoluteFill, styles.center]}>
          <MaterialCommunityIcons name={icon} size={iconSize} color="rgba(255,255,255,0.9)" />
        </LinearGradient>
      )}
      {fade && (
        <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']} style={[StyleSheet.absoluteFill, { top: '35%' }]} />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { overflow: 'hidden', backgroundColor: colors.primarySoft },
  center: { alignItems: 'center', justifyContent: 'center' },
});
