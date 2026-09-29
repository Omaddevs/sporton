import { Linking } from 'react-native';

export const openMaps = (venue) =>
  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${venue.coords.lat},${venue.coords.lng}`);

export const callPhone = (phone) => Linking.openURL(`tel:${phone}`);
