'use client';

import { useState } from 'react';
import { AuthGuard } from '@/components/auth';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { authService } from '@/services/auth.service';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [endingImpersonation, setEndingImpersonation] = useState(false);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const handleEndImpersonation = async () => {
    setEndingImpersonation(true);
    try {
      await authService.endImpersonation();
      const profile = await authService.getProfile();
      setUser(profile);
    } finally {
      setEndingImpersonation(false);
    }
  };

  return (
    <AuthGuard>
      <div className="flex h-screen flex-col">
        {user?.impersonatorAdminId ? (
          <div
            role="status"
            className="flex shrink-0 flex-wrap items-center justify-center gap-3 border-b border-amber-700 bg-amber-500 px-3 py-2 text-xs font-medium text-amber-950"
          >
            <span>Impersonation mode — you are signed in as this user; actions are audited.</span>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-7 border-amber-900 bg-amber-100 text-amber-950 hover:bg-amber-200"
              disabled={endingImpersonation}
              onClick={handleEndImpersonation}
            >
              {endingImpersonation ? 'Ending…' : 'Exit impersonation'}
            </Button>
          </div>
        ) : null}
        <div className="flex min-h-0 flex-1">
        <Sidebar 
          mobileOpen={mobileMenuOpen} 
          onMobileClose={() => setMobileMenuOpen(false)} 
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
          <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-6">
            {children}
          </main>
        </div>
        </div>
      </div>
    </AuthGuard>
  );
}
