'use client';

import { useEffect, useState } from 'react';
import { Wrench, Plus, Trash2, Edit2, GripVertical } from 'lucide-react';
import { useBusinessStore } from '@/store/business';
import { getServices, createService, updateService, deleteService } from '@/services/services';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Toggle } from '@/components/ui/Toggle';
import { useToast } from '@/components/ui/Toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { serviceSchema, type ServiceFormData } from '@/validations';
import { PRICE_TYPES, SUGGESTED_SERVICES } from '@/constants';
import { formatPrice } from '@/lib/utils';
import type { Service } from '@/types';

type SuggestedService = typeof SUGGESTED_SERVICES[number];

export default function ServicesPage() {
  const { business } = useBusinessStore();
  const toast = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [addingSuggested, setAddingSuggested] = useState<string | null>(null);

  const { register, handleSubmit, reset, watch, control, formState: { errors, isSubmitting } } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { price_type: 'fixed', duration_minutes: 60, is_active: true, sort_order: 0 },
  });

  const priceType = watch('price_type');

  const load = async () => {
    if (!business) { setLoading(false); return; }
    setLoading(true);
    try {
      setServices(await getServices(business.id));
    } catch {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [business]);

  const openCreate = () => {
    setEditingService(null);
    reset({ price_type: 'fixed', duration_minutes: 60, is_active: true, sort_order: services.length });
    setModalOpen(true);
  };

  const openEdit = (service: Service) => {
    setEditingService(service);
    reset({
      name: service.name, description: service.description || '', duration_minutes: service.duration_minutes,
      price_type: service.price_type, price_min: service.price_min ?? undefined, price_max: service.price_max ?? undefined,
      is_active: service.is_active, sort_order: service.sort_order,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data: ServiceFormData) => {
    if (!business) return;
    try {
      if (editingService) {
        const updated = await updateService(editingService.id, data);
        setServices((prev) => prev.map((s) => s.id === updated.id ? updated : s));
        toast.success('Service updated');
      } else {
        const created = await createService(business.id, data);
        setServices((prev) => [...prev, created]);
        toast.success('Service added');
      }
      setModalOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(editingService ? 'Failed to update service' : 'Failed to add service', msg);
    }
  };

  const addSuggestedService = async (suggested: SuggestedService) => {
    if (!business) return;
    setAddingSuggested(suggested.name);
    try {
      const created = await createService(business.id, {
        name: suggested.name, description: suggested.description, duration_minutes: suggested.duration_minutes,
        price_type: suggested.price_type, price_min: suggested.price_min, price_max: suggested.price_max ?? undefined,
        is_active: true, sort_order: services.length,
      });
      setServices((prev) => [...prev, created]);
      toast.success(`"${suggested.name}" added`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error('Failed to add service', msg);
    } finally {
      setAddingSuggested(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
      toast.success('Service deleted');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error('Failed to delete service', msg);
    } finally {
      setDeletingId(null);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          title="Services"
          description="Manage your auto repair services"
          action={<Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>Add Service</Button>}
        />

        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : services.length === 0 ? (
          <EmptyState
            icon={<Wrench className="w-5 h-5" />}
            title="No services yet"
            description="Add your services so the AI can accurately answer customer questions about pricing and availability"
            action={{ label: 'Add Service', onClick: openCreate }}
          />
        ) : (
          <div className="space-y-2">
            {services.map((service) => (
              <div key={service.id} className="flex items-center gap-4 p-4 rounded-xl transition-all duration-100"
                style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}>
                <GripVertical className="w-4 h-4 flex-shrink-0" style={{ color: '#2a3f4d' }} />
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#4b6070' }}>
                  <Wrench className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold" style={{ color: '#e2e8f0' }}>{service.name}</span>
                    {!service.is_active && <Badge variant="gray">Inactive</Badge>}
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: '#3d5060' }}>
                    {service.duration_minutes} min · {formatPrice(service.price_min, service.price_max, service.price_type)}
                  </div>
                  {service.description && (
                    <div className="text-[11px] mt-0.5 truncate" style={{ color: '#3d5060' }}>{service.description}</div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button variant="ghost" size="sm" icon={<Edit2 className="w-4 h-4" />} onClick={() => openEdit(service)} />
                  <Button variant="ghost" size="sm" icon={<Trash2 className="w-4 h-4" style={{ color: '#f87171' }} />} onClick={() => setDeleteId(service.id)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {services.length === 0 && !loading && (
        <Card>
          <CardHeader title="Quick Start — Add Common Services" description="Click any service below to instantly add it to your catalog" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SUGGESTED_SERVICES.map((s) => (
              <button
                key={s.name}
                onClick={() => addSuggestedService(s)}
                disabled={addingSuggested === s.name}
                className="flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(34,197,94,0.25)'; (e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.04)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#4b6070' }}>
                  <Wrench className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold" style={{ color: '#e2e8f0' }}>{s.name}</div>
                  <div className="text-[11px] mt-0.5 truncate" style={{ color: '#3d5060' }}>{s.description}</div>
                  <div className="text-[11px] font-medium mt-1" style={{ color: '#4ade80' }}>{formatPrice(s.price_min, s.price_max ?? null, s.price_type)} · {s.duration_minutes} min</div>
                </div>
                <div className="flex-shrink-0">
                  {addingSuggested === s.name ? (
                    <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'rgba(34,197,94,0.5)', borderTopColor: 'transparent' }} />
                  ) : (
                    <Plus className="w-4 h-4" style={{ color: '#3d5060' }} />
                  )}
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingService ? 'Edit Service' : 'Add Service'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Service Name" placeholder="Oil Change" error={errors.name?.message} required {...register('name')} />
          <Textarea label="Description" rows={2} placeholder="Brief description for the AI..." {...register('description')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Duration (minutes)" type="number" min={15} max={480} {...register('duration_minutes', { valueAsNumber: true })} />
            <Select label="Price Type" options={PRICE_TYPES.map((p) => ({ value: p.value, label: p.label }))} {...register('price_type')} />
          </div>
          {(priceType === 'fixed' || priceType === 'starting_at') && (
            <Input label="Price ($)" type="number" min={0} step="0.01" placeholder="49.99" {...register('price_min', { valueAsNumber: true })} />
          )}
          {priceType === 'range' && (
            <div className="grid grid-cols-2 gap-4">
              <Input label="Min Price ($)" type="number" min={0} step="0.01" {...register('price_min', { valueAsNumber: true })} />
              <Input label="Max Price ($)" type="number" min={0} step="0.01" {...register('price_max', { valueAsNumber: true })} />
            </div>
          )}
          <Controller
            control={control}
            name="is_active"
            render={({ field }) => (
              <Toggle label="Service is active" checked={field.value} onChange={field.onChange} />
            )}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>{editingService ? 'Save' : 'Add Service'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Service" size="sm">
        <p className="text-[13px] mb-5" style={{ color: '#94a3b8' }}>This service will be removed. Existing appointments will not be affected.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" loading={deletingId === deleteId} onClick={() => deleteId && handleDelete(deleteId)}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
