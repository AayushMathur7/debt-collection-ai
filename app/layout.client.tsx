'use client';

import { Navigation } from '@/components/ui/navigation';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto py-6 px-4">
        {children}
      </main>
    </div>
  );
} 