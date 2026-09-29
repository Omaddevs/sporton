import React from 'react';
import { colors } from '../theme';
import { useApp } from '../context/AppContext';
import { useLayout } from '../hooks/useLayout';
import { VENUES } from '../data/venues';
import { WORKOUTS } from '../data/workouts';
import { EVENTS } from '../data/events';
import { NEWS } from '../data/news';
import { ICONS } from '../data/icons';
import { bookingStart, isBookingUpcoming } from '../utils/booking';
import HomeDesktop from './home/HomeDesktop';
import HomeMobile from './home/HomeMobile';

/** Bosh sahifa: keng ekranda sayt ko'rinishi, telefonda ilova ko'rinishi. Ma'lumot va navigatsiya umumiy. */
export default function HomeScreen({ navigation }) {
  const { isDesktop } = useLayout();
  const { bookings } = useApp();

  const go = {
    venues: (params) => navigation.navigate('Tabs', { screen: 'Venues', params }),
    venue: (id) => navigation.navigate('VenueDetail', { id }),
    book: (venueId) => navigation.navigate('Booking', { venueId }),
    workouts: () => navigation.navigate('Tabs', { screen: 'Workouts' }),
    workout: (id) => navigation.navigate('WorkoutDetail', { id }),
    events: () => navigation.navigate('Events'),
    event: (id) => navigation.navigate('EventDetail', { id }),
    news: () => navigation.navigate('News'),
    newsItem: (id) => navigation.navigate('NewsDetail', { id }),
    bookings: () => navigation.navigate('Tabs', { screen: 'Bookings' }),
    search: (q) => navigation.navigate('Search', q ? { q } : undefined),
    location: () => navigation.navigate('Location'),
    notifications: () => navigation.navigate('Notifications'),
    profile: () => navigation.navigate('Tabs', { screen: 'Profile' }),
  };

  const categories = [
    { key: 'venues', title: 'Sport maydonlari', subtitle: `${VENUES.length} ta joy`, image: ICONS.stadium, icon: 'stadium-variant', colorsFrom: ['#34D399', '#059669'], onPress: () => go.venues() },
    { key: 'workouts', title: "Mashg'ulotlar", subtitle: `${WORKOUTS.length} ta dastur`, image: ICONS.dumbbell, icon: 'dumbbell', colorsFrom: ['#60A5FA', colors.blue], onPress: go.workouts },
    { key: 'events', title: 'Sport tadbirlari', subtitle: `${EVENTS.length} ta tadbir`, image: ICONS.trophy, icon: 'trophy', colorsFrom: ['#FCD34D', '#F59E0B'], onPress: go.events },
    { key: 'booking', title: 'Bron qilish', subtitle: '30 soniyada', image: ICONS.calendar, icon: 'calendar-clock', colorsFrom: [colors.primaryLight, colors.primary], badge: 'Tezkor', badgeColor: colors.primary, onPress: () => go.venues({ type: 'football' }) },
    { key: 'news', title: 'Yangiliklar', subtitle: `${NEWS.length} ta maqola`, image: ICONS.megaphone, icon: 'bullhorn', colorsFrom: ['#818CF8', colors.blue], badge: 'Yangi', badgeColor: colors.blue, onPress: go.news },
  ];

  const nearby = [...VENUES].sort((a, b) => a.distance - b.distance);
  const nextBooking = bookings.filter(isBookingUpcoming).sort((a, b) => bookingStart(a) - bookingStart(b))[0];

  const Layout = isDesktop ? HomeDesktop : HomeMobile;
  return <Layout go={go} categories={categories} nearby={nearby} nextBooking={nextBooking} />;
}
