import { FoodItem } from "./FoodItem";

export interface Restaurant {
  id: number;
  name: string;
  imageUrl: string;
  description: string;
  deliveryFee: number;
  estimatedDeliveryTime: string;
  rating: number;
  category?: string;
  menu?: FoodCategory[];
  openingTime?: string;
  closingTime?: string;
  isOpen24Hours?: boolean;
}

export interface FoodCategory {
  id: number;
  name: string;
  items: FoodItem[];
}
