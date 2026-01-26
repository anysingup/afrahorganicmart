import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { siteConfig } from '@/lib/data';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Leaf className="h-7 w-7 text-primary" />
      <span className="font-headline text-2xl font-bold text-foreground">
        {siteConfig.name}
      </span>
    </Link>
  );
}
