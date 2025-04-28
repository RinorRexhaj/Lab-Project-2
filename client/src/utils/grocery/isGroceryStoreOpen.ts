import { GroceryStore } from "../../types/grocery/GroceryStore";

export const isGroceryStoreOpen = (store: GroceryStore): boolean => {
  if (store.isOpen24Hours) {
    return true;
  }

  // If opening or closing times are not set, assume it's closed
  if (!store.openingTime || !store.closingTime) {
    return false;
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Convert current time to minutes
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  
  // Convert opening time to minutes
  const [openingHour, openingMinute] = store.openingTime.split(':').map(Number);
  const openingTimeInMinutes = openingHour * 60 + openingMinute;
  
  // Convert closing time to minutes
  const [closingHour, closingMinute] = store.closingTime.split(':').map(Number);
  let closingTimeInMinutes = closingHour * 60 + closingMinute;
  
  // If closing time is after midnight
  if (closingTimeInMinutes < openingTimeInMinutes) {
    closingTimeInMinutes += 24 * 60; 
    
    // If current time is after opening time
    if (currentTimeInMinutes >= openingTimeInMinutes) {
      return true; 
    }
    
    // If current time is before closing time (next day)
    return (currentTimeInMinutes + 24 * 60) <= closingTimeInMinutes;
  }
  
  // Normal case: opening and closing times are on the same day
  return currentTimeInMinutes >= openingTimeInMinutes && currentTimeInMinutes <= closingTimeInMinutes;
};

// Format opening hours for display
export const formatOpeningHours = (store: GroceryStore): string => {
  if (store.isOpen24Hours) {
    return "Open 24 hours";
  }
  
  if (!store.openingTime || !store.closingTime) {
    return "Hours not available";
  }
  
  // Format time to 12-hour format with AM/PM
  const formatTime = (timeString: string): string => {
    const [hourStr, minuteStr] = timeString.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };
  
  return `${formatTime(store.openingTime)} - ${formatTime(store.closingTime)}`;
};
