export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  images: string[];
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  isNew?: boolean;
  stock: number;
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
