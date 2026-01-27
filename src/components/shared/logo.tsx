import Link from 'next/link';
import Image from 'next/image';
import { siteConfig } from '@/lib/data';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image
        src="https://i.postimg.cc/t4L6n5Dv/Chat-GPT-Image-Jan-24-2026-01-59-32-PM.jpg"
        alt={`${siteConfig.name} Logo`}
        width={140}
        height={40}
        priority
        className="object-contain"
      />
    </Link>
  );
}
