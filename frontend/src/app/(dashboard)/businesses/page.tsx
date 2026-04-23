'use client';

import { useEffect, useMemo, useState } from 'react';
import { Building2, Loader2, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth-store';
import { businessService, BusinessTenant, TenantPlanCode, TenantStatus } from '@/services/business.service';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PLAN_OPTIONS: { value: TenantPlanCode; label: string }[] = [
  { value: 'BASIC', label: 'Basic' },
  { value: 'STANDARD', label: 'Standard' },
  { value: 'GROWTH', label: 'Growth' },
  { value: 'PRO', label: 'Pro' },
  { value: 'BUSINESS', label: 'Business' },
];

const STATUS_OPTIONS: { value: TenantStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'DELETED', label: 'Deleted' },
];

export default function BusinessesPage() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<BusinessTenant[]>([]);
  const [createOpen, setCreateOpen] = useState(false);

  const [newSlug, setNewSlug] = useState('acme');
  const [newName, setNewName] = useState('Acme Inc');
  const [newPlan, setNewPlan] = useState<TenantPlanCode>('BASIC');

  const canView = !!user?.isAdmin;

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await businessService.list();
      setTenants(data);
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Failed to load businesses', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canView) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canView]);

  const total = tenants.length;

  const createTenant = async () => {
    try {
      const created = await businessService.create({ slug: newSlug, name: newName, planCode: newPlan });
      toast({ title: 'Created', description: `Business ${created.slug} created` });
      setCreateOpen(false);
      await refresh();
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Failed to create business', variant: 'destructive' });
    }
  };

  const planLabel = useMemo(() => {
    const map = new Map(PLAN_OPTIONS.map((o) => [o.value, o.label]));
    return (p: TenantPlanCode) => map.get(p) || p;
  }, []);

  if (!canView) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Businesses</CardTitle>
          <CardDescription>Super Admin only</CardDescription>
        </CardHeader>
        <CardContent>You don’t have access to this page.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-5 w-5" /> Businesses
          </h1>
          <p className="text-muted-foreground">Create and manage customer subdomains and plans.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New business
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create business</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Subdomain slug</Label>
                  <Input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="acme" />
                </div>
                <div className="space-y-2">
                  <Label>Business name</Label>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Acme Inc" />
                </div>
                <div className="space-y-2">
                  <Label>Plan</Label>
                  <Select value={newPlan} onValueChange={(v) => setNewPlan(v as TenantPlanCode)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLAN_OPTIONS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={createTenant}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All businesses</CardTitle>
          <CardDescription>{total} total</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : tenants.length === 0 ? (
            <div className="text-muted-foreground">No businesses yet.</div>
          ) : (
            <div className="space-y-3">
              {tenants.map((t) => (
                <div key={t.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-lg border p-3">
                  <div>
                    <div className="font-medium">{t.name}</div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-mono">{t.slug}</span> · Plan {planLabel(t.planCode)} · Status {t.status}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={t.planCode}
                      onValueChange={async (v) => {
                        try {
                          await businessService.update(t.id, { planCode: v as TenantPlanCode });
                          await refresh();
                        } catch (e: any) {
                          toast({ title: 'Error', description: e?.message || 'Failed to update plan', variant: 'destructive' });
                        }
                      }}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLAN_OPTIONS.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={t.status}
                      onValueChange={async (v) => {
                        try {
                          await businessService.update(t.id, { status: v as TenantStatus });
                          await refresh();
                        } catch (e: any) {
                          toast({ title: 'Error', description: e?.message || 'Failed to update status', variant: 'destructive' });
                        }
                      }}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

