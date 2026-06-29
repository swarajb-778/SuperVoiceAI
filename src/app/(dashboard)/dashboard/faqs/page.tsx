'use client';

import { useEffect, useState } from 'react';
import { HelpCircle, Plus, Trash2, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import { useBusinessStore } from '@/store/business';
import { getFaqs, createFaq, updateFaq, deleteFaq } from '@/services/faqs';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { faqSchema, type FaqFormData } from '@/validations';
import type { FAQ } from '@/types';

export default function FaqsPage() {
  const { business } = useBusinessStore();
  const toast = useToast();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FaqFormData>({
    resolver: zodResolver(faqSchema),
    defaultValues: { is_active: true, sort_order: 0 },
  });

  const load = async () => {
    if (!business) { setLoading(false); return; }
    setLoading(true);
    try {
      setFaqs(await getFaqs(business.id));
    } catch {
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [business]);

  const openCreate = () => {
    setEditingFaq(null);
    reset({ is_active: true, sort_order: faqs.length });
    setModalOpen(true);
  };

  const openEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    reset({ question: faq.question, answer: faq.answer, category: faq.category || '', is_active: faq.is_active, sort_order: faq.sort_order });
    setModalOpen(true);
  };

  const onSubmit = async (data: FaqFormData) => {
    if (!business) return;
    try {
      if (editingFaq) {
        const updated = await updateFaq(editingFaq.id, data);
        setFaqs((prev) => prev.map((f) => f.id === updated.id ? updated : f));
        toast.success('FAQ updated');
      } else {
        const created = await createFaq(business.id, data);
        setFaqs((prev) => [...prev, created]);
        toast.success('FAQ added');
      }
      setModalOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(editingFaq ? 'Failed to update FAQ' : 'Failed to add FAQ', msg);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteFaq(id);
      setFaqs((prev) => prev.filter((f) => f.id !== id));
      toast.success('FAQ deleted');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error('Failed to delete FAQ', msg);
    } finally {
      setDeletingId(null);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          title="FAQs"
          description="Knowledge base for your AI agent"
          action={<Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>Add FAQ</Button>}
        />

        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : faqs.length === 0 ? (
          <EmptyState
            icon={<HelpCircle className="w-5 h-5" />}
            title="No FAQs yet"
            description="Add common questions and answers so your AI can provide accurate information to customers"
            action={{ label: 'Add FAQ', onClick: openCreate }}
          />
        ) : (
          <div className="space-y-2">
            {faqs.map((faq) => (
              <div key={faq.id} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer transition-colors duration-100"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
                  onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}
                >
                  <HelpCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#4ade80' }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-medium" style={{ color: '#e2e8f0' }}>{faq.question}</span>
                      {faq.category && <Badge variant="blue">{faq.category}</Badge>}
                      {!faq.is_active && <Badge variant="gray">Inactive</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" icon={<Edit2 className="w-3.5 h-3.5" />} onClick={(e) => { e.stopPropagation(); openEdit(faq); }} />
                    <Button variant="ghost" size="sm" icon={<Trash2 className="w-3.5 h-3.5" style={{ color: '#f87171' }} />} onClick={(e) => { e.stopPropagation(); setDeleteId(faq.id); }} />
                    {expanded === faq.id
                      ? <ChevronUp className="w-4 h-4 ml-1" style={{ color: '#3d5060' }} />
                      : <ChevronDown className="w-4 h-4 ml-1" style={{ color: '#3d5060' }} />
                    }
                  </div>
                </div>
                {expanded === faq.id && (
                  <div className="px-11 pb-4 text-[13px] leading-relaxed" style={{ color: '#64748b', background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="pt-3">{faq.answer}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingFaq ? 'Edit FAQ' : 'Add FAQ'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Question" placeholder="What are your hours?" error={errors.question?.message} required {...register('question')} />
          <Textarea label="Answer" rows={4} placeholder="We are open Monday through Friday..." error={errors.answer?.message} required {...register('answer')} />
          <Input label="Category (optional)" placeholder="Hours, Pricing, Services..." {...register('category')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>{editingFaq ? 'Save' : 'Add FAQ'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete FAQ" size="sm">
        <p className="text-[13px] mb-5" style={{ color: '#94a3b8' }}>This FAQ will be removed from your AI knowledge base.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" loading={deletingId === deleteId} onClick={() => deleteId && handleDelete(deleteId)}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
