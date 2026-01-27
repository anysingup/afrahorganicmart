import Link from 'next/link';
import { siteConfig } from '@/lib/data';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="font-headline text-xl font-bold">{siteConfig.name}</span>
    </Link>
  );
}
