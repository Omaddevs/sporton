import React from 'react';
import { Image } from 'react-native';

// Rasmlar scripts/make_logo.py orqali vektor (SVG) manbadan 3840px kenglikda chiqarilgan
const LOGO_WHITE = require('../../assets/logo/sporton-logo.png');
const LOGO_COLOR = require('../../assets/logo/sporton-logo-color.png');
const ASPECT = 3840 / 757;

/**
 * «SportON» brend logotipi.
 *  - light: ko'k/rangli fon ustida oq yozuvli variant
 *  - aks holda oq fon ustida ko'k yozuvli variant
 *  size — taxminan harf o'lchami (eski API bilan moslik uchun); logo balandligi size * 1.35.
 */
export default function Logo({ size = 26, light = false }) {
  const height = size * 1.35;
  return (
    <Image
      source={light ? LOGO_WHITE : LOGO_COLOR}
      style={{ height, width: height * ASPECT }}
      resizeMode="contain"
      accessibilityLabel="SportON"
    />
  );
}
