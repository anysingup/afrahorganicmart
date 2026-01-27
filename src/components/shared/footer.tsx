import Link from 'next/link';
import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import Logo from './logo';
import { siteConfig } from '@/lib/data';

function TiktokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 28.54 32.55"
      {...props}
    >
      <path d="M28.54,11.39a3.86,3.86,0,0,0-3.33-3.48V4.49A4.49,4.49,0,0,0,20.72,0H4.49A4.49,4.49,0,0,0,0,4.49V28.06a4.49,4.49,0,0,0,4.49,4.49H20.72a4.49,4.49,0,0,0,4.49-4.49V19.18a4.63,4.63,0,0,0,3.33-4.27V11.53Zm-5.32,17.1a2,2,0,0,1-2,2H5.16a2,2,0,0,1-2-2V5.16a2,2,0,0,1,2-2H17.29v17a4.4,4.4,0,0,1-4.4,4.4H4.49V22.25h8.4a.67.67,0,0,0,.67-.67V7.91h3.73Z" />
    </svg>
  );
}


export default function Footer() {
  return (
    <footer className="bg-card text-card-foreground border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <Logo />
            <p className="text-muted-foreground text-sm">
              Bringing you the purest organic products from trusted sources. Freshness and quality guaranteed.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-headline font-semibold text-lg">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shop" className="text-muted-foreground hover:text-primary transition-colors">All Products</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>
          
          {/* Policies */}
          <div className="space-y-4">
            <h4 className="font-headline font-semibold text-lg">Our Policies</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-conditions" className="text-muted-foreground hover:text-primary transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/refund-policy" className="text-muted-foreground hover:text-primary transition-colors">Refund & Return Policy</Link></li>
            </ul>
          </div>

          {/* Contact Us */}
          <div className="space-y-4">
            <h4 className="font-headline font-semibold text-lg">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <MapPin className="h-4 w-4 mr-3 mt-1 shrink-0 text-primary" />
                <span className="text-muted-foreground">{siteConfig.address}</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 mr-3 shrink-0 text-primary" />
                <a href={`tel:${siteConfig.phone}`} className="text-muted-foreground hover:text-primary transition-colors">{siteConfig.phone}</a>
              </li>
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-3 shrink-0 text-primary" />
                <a href={`mailto:${siteConfig.email}`} className="text-muted-foreground hover:text-primary transition-colors">{siteConfig.email}</a>
              </li>
            </ul>
             <div className="flex space-x-4 mt-4">
              <Link href={siteConfig.social.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-6 w-6" />
                <span className="sr-only">Instagram</span>
              </Link>
               <Link href={siteConfig.social.tiktok} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <TiktokIcon className="h-6 w-6 fill-current" />
                <span className="sr-only">TikTok</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {siteConfig.name}. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
