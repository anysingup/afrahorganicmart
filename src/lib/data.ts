import type { Category, Product, Testimonial } from './types';

export const siteConfig = {
    name: "Afrah Organic Mart",
    phone: "01830989616",
    email: "contact@afrahorganic.com",
    address: "Dhaka, Bangladesh",
    social: {
        facebook: "https://www.facebook.com/profile.php?id=61587084541625",
        instagram: "https://www.instagram.com/afrahorganicmart/",
        tiktok: "https://www.tiktok.com/@afrahorganicmart",
    },
};

export const categories: Category[] = [
  { id: '1', name: 'Dates', slug: 'dates', image: 'category-dates' },
  { id: '2', name: 'Pure Gur', slug: 'pure-gur', image: 'category-gur' },
  { id: '3', name: 'Chia Seeds', slug: 'chia-seeds', image: 'category-chia' },
  { id: '4', name: 'Shutki', slug: 'shutki', image: 'category-shutki' },
  { id: '5', name: 'Pickles', slug: 'pickles', image: 'category-pickles' },
  { id: '6', name: 'Nuts', slug: 'nuts', image: 'category-nuts' },
];

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Anika Rahman',
    title: 'Regular Customer',
    quote: 'The quality of dates from Afrah Organic Mart is unparalleled. Always fresh and delicious. My family loves them!',
    avatar: 'avatar-1',
  },
  {
    id: '2',
    name: 'Fazle Rabbi',
    title: 'Health Enthusiast',
    quote: 'I trust Afrah for all my organic needs. Their chia seeds and nuts are top-notch. Highly recommended for a healthy lifestyle.',
    avatar: 'avatar-2',
  },
  {
    id: '3',
    name: 'Sadia Islam',
    title: 'Home Chef',
    quote: 'The pickles and gur have an authentic taste that reminds me of my village. It\'s clear they use high-quality, pure ingredients.',
    avatar: 'avatar-3',
  },
    {
    id: '4',
    name: 'Karim Ahmed',
    title: 'Fitness Coach',
    quote: 'Excellent source of natural energy. The mixed nuts are my go-to snack before workouts. Fast delivery is a huge plus!',
    avatar: 'avatar-4',
  },
];
