// src/types/menu.ts
export interface BackendCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface BackendMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  category?: BackendCategory; // ← optional: not always included
  imageUrl: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isSeasonal: boolean;
  calories: number | null;
  preparationTime: number;
  customizations: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export type MenuItem = BackendMenuItem;

export interface PaginatedMenuResponse {
  data: BackendMenuItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CategoryMenuResponse {
  category: BackendCategory;
  items: BackendMenuItem[];
}