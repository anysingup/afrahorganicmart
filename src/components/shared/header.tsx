'use client';

import Link from 'next/link';
import { Heart, Menu, Search, ShoppingCart, User, X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import Logo from './logo';
import { IconBadge } from '../ui/icon-badge';
import { siteConfig } from '@/lib/data';
import { useUser } from '@/firebase';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  // Placeholder for cart items count
  const cartItemCount = 1;
  const { user, isAdmin } = useUser();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Mobile Nav Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-sm p-6">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <Logo />
                <SheetClose asChild>
                  <Button variant="ghost" size="icon">
                    <X className="h-6 w-6" />
                  </Button>
                </SheetClose>
              </div>
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="relative mt-8">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search for products..." className="pl-10" />
              </div>
              <div className="mt-auto pt-8">
                <a href={`tel:${siteConfig.phone}`} className="text-primary font-bold">{`Call Us: ${siteConfig.phone}`}</a>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Desktop Logo */}
        <div className="hidden md:flex">
          <Logo />
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              href={link.href}
              key={link.href}
              className="font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:block relative w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
             <Input placeholder="Search..." className="pl-10" />
          </div>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/wishlist" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart" aria-label="Shopping Cart">
              <IconBadge count={cartItemCount}>
                <ShoppingCart className="h-5 w-5" />
              </IconBadge>
            </Link>
          </Button>
          {isAdmin && (
             <Button variant="ghost" size="icon" asChild>
              <Link href="/admin" aria-label="Admin Panel">
                <Shield className="h-5 w-5 text-primary" />
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" asChild>
            <Link href={user ? "/account" : "/admin/login"} aria-label="My Account">
              <User className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
