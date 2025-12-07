export enum UserRole {
  GUEST = 'GUEST',
  CLIENT = 'CLIENT',
  BROKER = 'BROKER',
  EMPLOYEE = 'EMPLOYEE',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  companyName?: string;
}

export interface Property {
  id: string;
  title: string;
  price: number;
  area: number;
  location: string;
  type: 'apartment' | 'villa' | 'land' | 'commercial';
  status: 'sale' | 'rent';
  image: string;
  images?: string[];
  bedrooms?: number;
  bathrooms?: number;
  finishing?: string;
  description?: string;
  ownerId?: string;
}

export interface ContractTemplate {
  id: string;
  name: string;
  content: string; // HTML or Markdown content with placeholders like {{BUYER_NAME}}
}

export interface NavItem {
  icon: any;
  label: string;
  id: string;
}