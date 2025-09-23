'use client';

import { usePathname } from 'next/navigation';
import { Navigation, Footer } from '@/components/layout';
import { AuthProvider } from '@/contexts/AuthContext';
import QueryProvider from '@/providers/QueryProvider';
import AdSlot from '@/components/ui/AdSlot';
import { Toaster } from 'react-hot-toast';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();

  // Check if current path is admin
  const isAdminPath = pathname?.startsWith('/admin');

  return (
    <QueryProvider>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              style: {
                background: '#198639',
              },
            },
            error: {
              duration: 4000,
              style: {
                background: '#ef4444',
              },
            },
          }}
        />
        {isAdminPath ? (
          // Admin paths have their own layout
          <>{children}</>
        ) : (
          // Regular user layout - with header/footer
          <div className="min-h-screen flex flex-col">
            <Navigation />
            {/* Top Advertisement Slot */}
            <AdSlot slot="top" />
            <main className="flex-1">
              {children}
            </main>
            {/* Footer Advertisement Slot */}
            <AdSlot slot="footer" />
            <Footer />
          </div>
        )}
      </AuthProvider>
    </QueryProvider>
  );
}