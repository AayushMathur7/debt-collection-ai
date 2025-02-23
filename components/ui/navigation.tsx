'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { path: '/configure-agent', label: 'Configure Agent' },
  { path: '/execute-campaign', label: 'Execute Campaign' },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-center border-b mt-4">
      <div className="flex space-x-4">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`px-4 py-2 text-sm font-medium transition-colors hover:text-foreground/80 ${
                isActive
                  ? 'border-b-2 border-foreground text-foreground'
                  : 'text-foreground/60'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 