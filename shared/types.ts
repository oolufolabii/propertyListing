// Property types
export interface Property {
	id: number;
	title: string;
	description: string;
	price: number;
	location: string;
	category: PropertyCategory;
	bedrooms?: number;
	bathrooms?: number;
	area?: number;
	featured: boolean;
	created_at: string;
	updated_at: string;
  }
  
  export interface PropertyImage {
	id: number;
	property_id: number;
	image_url: string;
	is_primary: boolean;
	created_at: string;
  }
  
  export interface PropertyWithImages extends Property {
	images: PropertyImage[];
  }
  
  export type PropertyCategory = 'sale' | 'rent' | 'lease' | 'land' | 'commercial';
  
  // Admin types
  export interface AdminUser {
	id: number;
	username: string;
	created_at: string;
  }
  
  // API response types
  export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
  }
  
  // Form types
  export interface PropertyFormData {
	title: string;
	description: string;
	price: number;
	location: string;
	category: PropertyCategory;
	bedrooms?: number;
	bathrooms?: number;
	area?: number;
	featured: boolean;
  }
  
  export interface LoginFormData {
	username: string;
	password: string;
  }
