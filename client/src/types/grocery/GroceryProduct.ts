export interface GroceryProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  unit?: string;
  weight?: string;
  inStock: boolean;
  categoryId?: number;
}