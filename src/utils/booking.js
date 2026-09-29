import { hashString, fromDateKey, toDateKey } from './format';

// Boshqa foydalanuvchilar tomonidan band qilingan slotlarni simulyatsiya qiladi (backend ulanganda API bilan almashtiriladi)
export const isSlotTakenByOthers = (venueId, fieldId, dateKey, hour) =>
  hashString(`${venueId}|${fieldId}|${dateKey}|${hour}`) % 100 < 28;

export const isSlotInPast = (dateKey, hour) => {
  if (dateKey !== toDateKey(new Date())) return false;
  return hour <= new Date().getHours();
};

export const isSlotBookedByUser = (bookings, venueId, fieldId, dateKey, hour) =>
  bookings.some(
    (b) =>
      b.status === 'active' &&
      b.venueId === venueId &&
      b.fieldId === fieldId &&
      b.date === dateKey &&
      hour >= b.startHour &&
      hour < b.startHour + b.duration
  );

export const getSlotStatus = (bookings, venueId, fieldId, dateKey, hour) => {
  if (isSlotInPast(dateKey, hour)) return 'past';
  if (isSlotBookedByUser(bookings, venueId, fieldId, dateKey, hour)) return 'mine';
  if (isSlotTakenByOthers(venueId, fieldId, dateKey, hour)) return 'busy';
  return 'free';
};

export const canBookRange = (bookings, venue, fieldId, dateKey, start, duration) => {
  if (start + duration > venue.close) return false;
  for (let h = start; h < start + duration; h++) {
    if (getSlotStatus(bookings, venue.id, fieldId, dateKey, h) !== 'free') return false;
  }
  return true;
};

export const bookingStart = (b) => {
  const d = fromDateKey(b.date);
  d.setHours(b.startHour, 0, 0, 0);
  return d;
};

export const bookingEnd = (b) => {
  const d = fromDateKey(b.date);
  d.setHours(b.startHour + b.duration, 0, 0, 0);
  return d;
};

export const isBookingUpcoming = (b) => b.status === 'active' && bookingEnd(b) > new Date();
