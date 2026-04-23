'use client';

import { useEffect, useState } from 'react';
import { useWorkspaces } from '@/hooks/use-workspace';
import { useWorkspaceStore, WorkspaceInfo } from '@/stores/workspace-store';
import { useAuthStore } from '@/stores/auth-store';
import { setWorkspaceIdResolver } from '@/lib/api-client';
import { getTenantSlugFromHost } from '@/lib/tenant';

// Register workspace resolver once at module load so every API request
// automatically includes the X-Workspace-Id header.
setWorkspaceIdResolver(() => useWorkspaceStore.getState().currentWorkspace?.id ?? null);

interface WorkspaceProviderProps {
  children: React.ReactNode;
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const { isAuthenticated, user, setWorkspace: setAuthWorkspaceId } = useAuthStore();
  const { setWorkspaces, setCurrentWorkspace, currentWorkspace, setLoading } = useWorkspaceStore();
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  useEffect(() => {
    setTenantSlug(getTenantSlugFromHost());
  }, []);

  const { data, isLoading, isSuccess } = useWorkspaces(
    { limit: 10 },
    { enabled: isAuthenticated }
  );

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    if (isSuccess && data?.data) {
      const workspaces: WorkspaceInfo[] = data.data.map((w) => ({
        id: w.id,
        name: w.name,
        slug: w.slug,
        description: w.description,
        isActive: w.status === 'active',
      }));

      setWorkspaces(workspaces);

      // Auto-select first workspace if none selected.
      // On tenant hosts, the subdomain resolves the business; the specific workspace still comes from the user's list.
      if (!currentWorkspace && workspaces.length > 0) {
        const first = workspaces[0];
        setCurrentWorkspace(first);
        setAuthWorkspaceId(first.id);
      }
    }
  }, [isSuccess, data, currentWorkspace, setWorkspaces, setCurrentWorkspace, tenantSlug, setAuthWorkspaceId]);

  // Reset workspace when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setAuthWorkspaceId(null);
    }
  }, [isAuthenticated, setWorkspaces, setCurrentWorkspace, setAuthWorkspaceId]);

  return <>{children}</>;
}

export default WorkspaceProvider;
