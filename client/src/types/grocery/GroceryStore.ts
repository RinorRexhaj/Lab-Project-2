import { GroceryProduct } from "./GroceryProduct";

export interface GroceryStore {
  id: number;
  name: string;
  imageUrl: string;
  description: string;
  deliveryFee: number;
  estimatedDeliveryTime: string;
  rating: number;
  category?: string;
  openingTime?: string;
  closingTime?: string;
  isOpen24Hours: boolean;
  products?: GroceryCategory[];
}

export interface GroceryCategory {
  id: number;
  name: string;
  items: GroceryProduct[];
}