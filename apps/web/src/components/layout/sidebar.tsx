'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Twitter, Image, Newspaper, Clock, Images } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/generator', icon: Twitter, label: '트윗 생성' },
  { href: '/image', icon: Image, label: '이미지 생성' },
  { href: '/briefing', icon: Newspaper, label: '리서치' },
  { href: '/tweet-history', icon: Clock, label: '트윗 히스토리' },
  { href: '/image-history', icon: Images, label: '이미지 히스토리' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-border h-screen sticky top-0 flex flex-col bg-background">
      {/* Brand */}
      <div className="h-14 flex items-center px-4 border-b border-border">
        <span className="font-bold text-sm tracking-tight">Web3 KOL</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
