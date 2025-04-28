export interface GroceryProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  categoryId: number;
  unit?: string;
  weight?: string;
  inStock: boolean;
}
