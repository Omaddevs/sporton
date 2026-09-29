import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme';
import { useApp } from '../context/AppContext';
import { isBookingUpcoming } from '../utils/booking';
import { useLayout } from '../hooks/useLayout';
import WebTopNav from '../components/WebTopNav';
import FloatingTabBar from '../components/FloatingTabBar';

import HomeScreen from '../screens/HomeScreen';
import VenuesScreen from '../screens/VenuesScreen';
import VenueDetailScreen from '../screens/VenueDetailScreen';
import BookingScreen from '../screens/BookingScreen';
import BookingSuccessScreen from '../screens/BookingSuccessScreen';
import BookingsScreen from '../screens/BookingsScreen';
import WorkoutsScreen from '../screens/WorkoutsScreen';
import WorkoutDetailScreen from '../screens/WorkoutDetailScreen';
import WorkoutPlayerScreen from '../screens/WorkoutPlayerScreen';
import EventsScreen from '../screens/EventsScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import NewsScreen from '../screens/NewsScreen';
import NewsDetailScreen from '../screens/NewsDetailScreen';
import SearchScreen from '../screens/SearchScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import LocationScreen from '../screens/LocationScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Pastki panelda ko'rinmaydigan, lekin ichki navigatsiya uchun kerak bo'lgan tablar (Majmualar, Mashg'ulotlar)
const HIDDEN_TAB = { tabBarButton: () => null, tabBarItemStyle: { display: 'none' } };

function Tabs() {
  const { bookings, notifications } = useApp();
  const upcoming = bookings.filter(isBookingUpcoming).length;
  const unread = notifications.filter((n) => !n.read).length;
  const { isDesktop } = useLayout();

  return (
    <Tab.Navigator
      // Desktop'da sayt uslubidagi yuqori menyu, mobilda suzuvchi kapsula tab bar
      tabBar={(props) => (isDesktop ? <WebTopNav {...props} /> : <FloatingTabBar {...props} />)}
      // "Orqaga" avvalgi tabga qaytaradi (Majmualar → Qidiruv), birinchi tabga sakramaydi
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarPosition: isDesktop ? 'top' : 'bottom',
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Bosh sahifa' }} />
      <Tab.Screen name="SearchTab" component={SearchScreen} options={{ title: 'Qidiruv' }} />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          title: 'Bronlarim',
          tabBarBadge: upcoming || undefined,
        }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{
          title: 'Bildirishnomalar',
          tabBarLabel: 'Xabarlar', // tor ekranda 'Bildirishnomalar' sig'maydi
          tabBarBadge: unread || undefined,
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
      <Tab.Screen name="Venues" component={VenuesScreen} options={{ title: 'Majmualar', ...HIDDEN_TAB }} />
      <Tab.Screen name="Workouts" component={WorkoutsScreen} options={{ title: 'Mashg\'ulot', ...HIDDEN_TAB }} />
    </Tab.Navigator>
  );
}

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg, primary: colors.primary },
};

export default function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="VenueDetail" component={VenueDetailScreen} />
        <Stack.Screen name="Booking" component={BookingScreen} />
        <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
        <Stack.Screen name="WorkoutPlayer" component={WorkoutPlayerScreen} options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
        <Stack.Screen name="Events" component={EventsScreen} />
        <Stack.Screen name="EventDetail" component={EventDetailScreen} />
        <Stack.Screen name="News" component={NewsScreen} />
        <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
        <Stack.Screen name="Search" component={SearchScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen
          name="Location"
          component={LocationScreen}
          options={{ presentation: Platform.OS === 'ios' ? 'modal' : 'card', animation: 'slide_from_bottom' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
