'use client';

import { useUser } from '@/hooks/useAuth';
import { useMounted } from '@/hooks/useMounted';
import { DashboardNav } from '@/components/layout/DashboardNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useUser();
  const mounted = useMounted();

  // Prevent hydration mismatch by showing loading state until mounted
  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
