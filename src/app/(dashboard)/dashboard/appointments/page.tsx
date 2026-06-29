'use client';

import { useEffect, useState, useCallback } from 'react';
import { Calendar, Plus, Search } from 'lucide-react';
import { useBusinessStore } from '@/store/business';
import { getAppointments, createAppointment, updateAppointmentStatus } from '@/services/appointments';
import { getServices } from '@/services/services';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { appointmentSchema, type AppointmentFormData } from '@/validations';
import { APPOINTMENT_STATUSES } from '@/constants';
import { formatDateTime } from '@/lib/utils';
import type { Appointment, Service } from '@/types';

const PAGE_SIZE = 20;

export default function AppointmentsPage() {
  const { business } = useBusinessStore();
  const toast = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: { status: 'pending', duration_minutes: 60 },
  });

  const load = useCallback(async () => {
    if (!business) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data, count } = await getAppointments(business.id, {
        status: statusFilter || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });
      setAppointments(data);
      setTotal(count);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business, statusFilter, page]);

  useEffect(() => {
    if (business) {
      getServices(business.id).then(setServices).catch(() => {});
    }
  }, [business]);

  useEffect(() => { load(); }, [load]);

  const onSubmit = async (data: AppointmentFormData) => {
    if (!business) return;
    try {
      const created = await createAppointment(business.id, data);
      setAppointments((prev) => [created, ...prev]);
      setModalOpen(false);
      reset();
      toast.success('Appointment booked');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error('Failed to book appointment', msg);
    }
  };

  const handleStatusChange = async (apptId: string, status: string) => {
    try {
      await updateAppointmentStatus(apptId, status);
      setAppointments((prev) => prev.map((a) => a.id === apptId ? { ...a, status: status as Appointment['status'] } : a));
      toast.success('Status updated');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error('Failed to update status', msg);
    }
  };

  const filteredAppointments = appointments.filter((a) =>
    !search || a.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    (a.customer_phone && a.customer_phone.includes(search))
  );

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          title="Appointments"
          description={`${total} total appointments`}
          action={
            <Button icon={<Plus className="w-4 h-4" />} onClick={() => { reset(); setModalOpen(true); }}>
              New Appointment
            </Button>
          }
        />

        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="flex-1 min-w-48">
            <Input
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="w-44">
            <Select
              options={[
                { value: '', label: 'All Statuses' },
                ...APPOINTMENT_STATUSES.map((s) => ({ value: s.value, label: s.label })),
              ]}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : filteredAppointments.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-5 h-5" />}
            title="No appointments found"
            description="Appointments booked through AI calls will appear here"
            action={{ label: 'Book Appointment', onClick: () => setModalOpen(true) }}
          />
        ) : (
          <>
            <Table>
              <TableHead>
                <TableHeader>Customer</TableHeader>
                <TableHeader>Vehicle</TableHeader>
                <TableHeader>Service</TableHeader>
                <TableHeader>Scheduled</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableHead>
              <TableBody>
                {filteredAppointments.map((appt) => (
                  <TableRow key={appt.id}>
                    <TableCell>
                      <div className="font-medium" style={{ color: '#e2e8f0' }}>{appt.customer_name}</div>
                      <div className="text-[11px]" style={{ color: '#3d5060' }}>{appt.customer_phone}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-[12px]" style={{ color: '#64748b' }}>
                        {appt.vehicle_year} {appt.vehicle_make} {appt.vehicle_model}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-[12px]" style={{ color: '#64748b' }}>{(appt as Appointment & { service?: Service }).service?.name || '—'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[12px]" style={{ color: '#94a3b8' }}>{formatDateTime(appt.scheduled_at)}</span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={appt.status} />
                    </TableCell>
                    <TableCell>
                      <Select
                        options={APPOINTMENT_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
                        value={appt.status}
                        onChange={(e) => handleStatusChange(appt.id, e.target.value)}
                        className="text-[12px] py-1"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {total > PAGE_SIZE && (
              <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <span className="text-[12px]" style={{ color: '#4b6070' }}>
                  Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
                </span>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
                  <Button variant="secondary" size="sm" disabled={(page + 1) * PAGE_SIZE >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Book Appointment" size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Customer Name" placeholder="John Smith" error={errors.customer_name?.message} required {...register('customer_name')} />
            <Input label="Phone Number" placeholder="(555) 000-0000" error={errors.customer_phone?.message} {...register('customer_phone')} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Vehicle Year" placeholder="2021" {...register('vehicle_year')} />
            <Input label="Make" placeholder="Toyota" {...register('vehicle_make')} />
            <Input label="Model" placeholder="Camry" {...register('vehicle_model')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Service"
              options={[{ value: '', label: 'Select service' }, ...services.map((s) => ({ value: s.id, label: s.name }))]}
              {...register('service_id')}
            />
            <Input label="Date & Time" type="datetime-local" error={errors.scheduled_at?.message} required {...register('scheduled_at')} />
          </div>
          <Select
            label="Status"
            options={APPOINTMENT_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
            {...register('status')}
          />
          <Textarea label="Notes" rows={2} placeholder="Any notes..." {...register('notes')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>Book Appointment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
