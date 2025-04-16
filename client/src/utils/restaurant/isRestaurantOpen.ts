import { Restaurant } from "../../types/restaurant/Restaurant";


export const isRestaurantOpen = (restaurant: Restaurant): boolean => {
  
  if (restaurant.isOpen24Hours) {
    return true;
  }

  // If opening or closing times are not set, assume it's closed
  if (!restaurant.openingTime || !restaurant.closingTime) {
    return false;
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Convert current time to minutes
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  
  // Convert opening time to minutes
  const [openingHour, openingMinute] = restaurant.openingTime.split(':').map(Number);
  const openingTimeInMinutes = openingHour * 60 + openingMinute;
  
  
  const [closingHour, closingMinute] = restaurant.closingTime.split(':').map(Number);
  let closingTimeInMinutes = closingHour * 60 + closingMinute;
  
  // If closing time is after midnight
  if (closingTimeInMinutes < openingTimeInMinutes) {
    closingTimeInMinutes += 24 * 60; 
    
 
    if (currentTimeInMinutes >= openingTimeInMinutes) {
      return true; 
    }
    

    return (currentTimeInMinutes + 24 * 60) <= closingTimeInMinutes;
  }
  

  return currentTimeInMinutes >= openingTimeInMinutes && currentTimeInMinutes <= closingTimeInMinutes;
};

//Format Oren
export const formatOpeningHours = (restaurant: Restaurant): string => {
  if (restaurant.isOpen24Hours) {
    return "Open 24 hours";
  }
  
  if (!restaurant.openingTime || !restaurant.closingTime) {
    return "Hours not available";
  }
  

  const formatTime = (timeString: string): string => {
    const [hourStr, minuteStr] = timeString.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };
  
  return `${formatTime(restaurant.openingTime)} - ${formatTime(restaurant.closingTime)}`;
};
