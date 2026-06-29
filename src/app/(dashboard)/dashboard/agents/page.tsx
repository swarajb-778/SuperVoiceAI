'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Plus, Mic, Trash2, ToggleLeft, ToggleRight, Edit2, Play } from 'lucide-react';
import Link from 'next/link';
import { useBusinessStore } from '@/store/business';
import { getAgents, createAgent, updateAgent, deleteAgent, toggleAgentStatus } from '@/services/agents';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { agentSchema, type AgentFormData } from '@/validations';
import { AGENT_VOICES, AGENT_PERSONALITIES, INTERRUPT_SENSITIVITIES, SUGGESTED_AGENTS } from '@/constants';
import type { Agent } from '@/types';

export default function AgentsPage() {
  const { business } = useBusinessStore();
  const toast = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [addingSuggested, setAddingSuggested] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
    defaultValues: { voice: 'alloy', language: 'en', personality: 'professional', max_call_duration: 600, interrupt_sensitivity: 'medium', is_active: true },
  });

  const load = async () => {
    if (!business) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await getAgents(business.id);
      setAgents(data);
    } catch {
      toast.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [business]);

  const openCreate = () => {
    setEditingAgent(null);
    reset({ voice: 'alloy', language: 'en', personality: 'professional', max_call_duration: 600, interrupt_sensitivity: 'medium', is_active: true });
    setModalOpen(true);
  };

  const openEdit = (agent: Agent) => {
    setEditingAgent(agent);
    reset({
      name: agent.name, voice: agent.voice, language: agent.language, personality: agent.personality,
      greeting_message: agent.greeting_message || '', system_prompt: agent.system_prompt || '',
      max_call_duration: agent.max_call_duration, interrupt_sensitivity: agent.interrupt_sensitivity, is_active: agent.is_active,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data: AgentFormData) => {
    if (!business) {
      toast.error('No business found', 'Please refresh the page and try again');
      return;
    }
    try {
      if (editingAgent) {
        const updated = await updateAgent(editingAgent.id, data);
        setAgents((prev) => prev.map((a) => a.id === updated.id ? updated : a));
        toast.success('Agent updated');
      } else {
        const created = await createAgent(business.id, data);
        setAgents((prev) => [created, ...prev]);
        toast.success('Agent created');
      }
      setModalOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      const isRls = msg.includes('row-level security') || msg.includes('42501');
      toast.error(
        editingAgent ? 'Failed to update agent' : 'Failed to create agent',
        isRls ? 'Session expired — please sign out and sign back in' : msg
      );
    }
  };

  const addSuggestedAgent = async (suggested: typeof SUGGESTED_AGENTS[number]) => {
    if (!business) {
      toast.error('No business found', 'Please refresh the page and try again');
      return;
    }
    setAddingSuggested(suggested.name);
    try {
      const created = await createAgent(business.id, {
        name: suggested.name, voice: suggested.voice, language: 'en', personality: suggested.personality,
        greeting_message: suggested.greeting_message, system_prompt: suggested.system_prompt,
        max_call_duration: 600, interrupt_sensitivity: suggested.interrupt_sensitivity, is_active: true,
      });
      setAgents((prev) => [created, ...prev]);
      toast.success(`"${suggested.name}" created and activated`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error('Failed to create agent', msg);
    } finally {
      setAddingSuggested(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteAgent(id);
      setAgents((prev) => prev.filter((a) => a.id !== id));
      toast.success('Agent deleted');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error('Failed to delete agent', msg);
    } finally {
      setDeletingId(null);
      setDeleteId(null);
    }
  };

  const handleToggle = async (agent: Agent) => {
    try {
      await toggleAgentStatus(agent.id, !agent.is_active);
      setAgents((prev) => prev.map((a) => a.id === agent.id ? { ...a, is_active: !a.is_active } : a));
      toast.success(agent.is_active ? 'Agent deactivated' : 'Agent activated');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error('Failed to update agent status', msg);
    }
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          title="AI Agents"
          description="Configure your AI voice agents"
          action={<Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>New Agent</Button>}
        />

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : agents.length === 0 ? (
          <EmptyState
            icon={<Bot className="w-5 h-5" />}
            title="No agents yet"
            description="Create your first AI voice agent to start handling customer calls"
            action={{ label: 'Create Agent', onClick: openCreate }}
          />
        ) : (
          <div className="space-y-3">
            {agents.map((agent, i) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-xl transition-all duration-150"
                style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>
                  <Mic className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold" style={{ color: '#e2e8f0' }}>{agent.name}</span>
                    <Badge variant={agent.is_active ? 'green' : 'gray'}>
                      {agent.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: '#3d5060' }}>
                    Voice: {agent.voice} · Personality: {agent.personality} · {agent.interrupt_sensitivity} interruption
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/dashboard/agents/${agent.id}`}>
                    <Button variant="outline" size="sm" icon={<Play className="w-3.5 h-3.5" />}>Test</Button>
                  </Link>
                  <Button variant="ghost" size="sm"
                    icon={agent.is_active ? <ToggleRight className="w-4 h-4" style={{ color: '#4ade80' }} /> : <ToggleLeft className="w-4 h-4" style={{ color: '#3d5060' }} />}
                    onClick={() => handleToggle(agent)}
                  />
                  <Button variant="ghost" size="sm" icon={<Edit2 className="w-4 h-4" />} onClick={() => openEdit(agent)} />
                  <Button variant="ghost" size="sm" icon={<Trash2 className="w-4 h-4" style={{ color: '#f87171' }} />} onClick={() => setDeleteId(agent.id)} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {agents.length === 0 && !loading && (
        <Card>
          <CardHeader title="Start with a Pre-Built Agent" description="Choose a ready-made agent persona and activate it instantly" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SUGGESTED_AGENTS.map((s) => (
              <div key={s.name} className="rounded-xl p-4 transition-all duration-150 cursor-pointer"
                style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(34,197,94,0.25)'; (e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.04)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold leading-tight" style={{ color: '#e2e8f0' }}>{s.name}</div>
                    <div className="text-[11px] capitalize" style={{ color: '#3d5060' }}>{s.personality} · {s.voice}</div>
                  </div>
                </div>
                <p className="text-[12px] leading-relaxed mb-3 line-clamp-2" style={{ color: '#4b6070' }}>
                  {s.greeting_message}
                </p>
                <Button size="sm" className="w-full" loading={addingSuggested === s.name} onClick={() => addSuggestedAgent(s)}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add This Agent
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingAgent ? 'Edit Agent' : 'Create Agent'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Agent Name" placeholder="Reception AI" error={errors.name?.message} {...register('name')} required />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Voice" options={AGENT_VOICES.map((v) => ({ value: v.value, label: v.label }))} error={errors.voice?.message} {...register('voice')} />
            <Select label="Personality" options={AGENT_PERSONALITIES.map((p) => ({ value: p.value, label: p.label }))} error={errors.personality?.message} {...register('personality')} />
          </div>
          <Select label="Interruption Sensitivity" options={INTERRUPT_SENSITIVITIES.map((i) => ({ value: i.value, label: i.label }))} {...register('interrupt_sensitivity')} />
          <Textarea label="Greeting Message" rows={2} placeholder="Hello! Thank you for calling..." {...register('greeting_message')} />
          <Textarea label="System Prompt" rows={5} placeholder="You are a professional auto repair receptionist..." hint="Instructions for how the AI should behave" {...register('system_prompt')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isSubmitting}>{editingAgent ? 'Save Changes' : 'Create Agent'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Agent" size="sm">
        <p className="text-[13px] mb-5" style={{ color: '#94a3b8' }}>Are you sure you want to delete this agent? This cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" loading={deletingId === deleteId} onClick={() => deleteId && handleDelete(deleteId)}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
