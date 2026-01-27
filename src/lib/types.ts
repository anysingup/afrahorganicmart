import { Timestamp } from "firebase/firestore";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  images: string[];
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  isNew?: boolean;
  stock: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export interface Testimonial {
  id: string;
  name: string;
  title: string;
  quote: string;
  avatar: string;
}

export interface Order {
    id?: string;
    userId: string | null;
    productName: string;
    quantity: number;
    totalPrice: number;
    customerName: string;
    address: string;
    phone: string;
    paymentMethod: string;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    createdAt: Timestamp;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: Timestamp;
}

export interface UserProfile {
  displayName: string;
  email: string;
  photoURL?: string;
}

export interface WishlistItem {
  id: string;
  productId: string;
  addedAt: Timestamp;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  addedAt: Timestamp;
}
