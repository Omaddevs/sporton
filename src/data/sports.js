export const SPORT_TYPES = [
  { id: 'football', name: 'Mini-futbol', icon: 'soccer', color: '#16A34A' },
  { id: 'tennis', name: 'Tennis', icon: 'tennis', color: '#84CC16' },
  { id: 'swimming', name: 'Suzish', icon: 'swim', color: '#0EA5E9' },
  { id: 'gym', name: 'Fitnes', icon: 'dumbbell', color: '#1F6BFF' },
  { id: 'basketball', name: 'Basketbol', icon: 'basketball', color: '#F97316' },
  { id: 'boxing', name: 'Boks', icon: 'boxing-glove', color: '#EF4444' },
  { id: 'yoga', name: 'Yoga', icon: 'yoga', color: '#A855F7' },
  { id: 'volleyball', name: 'Voleybol', icon: 'volleyball', color: '#EAB308' },
];

export const getSport = (id) => SPORT_TYPES.find((s) => s.id === id) || SPORT_TYPES[0];

export const DISTRICTS = [
  'Yunusobod tumani',
  'Mirzo Ulug\'bek tumani',
  'Chilonzor tumani',
  'Yakkasaroy tumani',
  'Mirobod tumani',
  'Shayxontohur tumani',
  'Uchtepa tumani',
  'Olmazor tumani',
  'Sergeli tumani',
  'Yashnobod tumani',
  'Bektemir tumani',
  'Yangihayot tumani',
];

export const AMENITIES = {
  parking: { label: 'Avtoturargoh', icon: 'parking' },
  shower: { label: 'Dush', icon: 'shower' },
  locker: { label: 'Kiyinish xonasi', icon: 'hanger' },
  wifi: { label: 'Wi-Fi', icon: 'wifi' },
  light: { label: 'Tungi yoritish', icon: 'lightbulb-on-outline' },
  cafe: { label: 'Kafe', icon: 'coffee' },
  tribune: { label: 'Tribuna', icon: 'account-group' },
  uniform: { label: 'Forma ijarasi', icon: 'tshirt-crew' },
  ac: { label: 'Konditsioner', icon: 'air-conditioner' },
  medical: { label: 'Tibbiy yordam', icon: 'medical-bag' },
  cctv: { label: 'Videokuzatuv', icon: 'cctv' },
  water: { label: 'Ichimlik suvi', icon: 'water' },
};
