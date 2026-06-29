'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Bot, Mic, MicOff, PhoneOff, Loader2,
  Settings2, MessageSquare, CheckCircle2, AlertCircle,
  Wand2, Play, RotateCcw, Clock, User,
} from 'lucide-react';

import Link from 'next/link';
import { useBusinessStore } from '@/store/business';
import { getAgents, updateAgent } from '@/services/agents';
import { useRealtimeVoice } from '@/hooks/useRealtimeVoice';
import { useVoiceStore } from '@/store/voice';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { agentSchema, type AgentFormData } from '@/validations';
import { AGENT_VOICES, AGENT_PERSONALITIES, INTERRUPT_SENSITIVITIES } from '@/constants';
import { cn } from '@/lib/utils';
import type { Agent } from '@/types';

interface PageProps {
  params: { id: string };
}

export default function AgentDetailPage({ params }: PageProps) {
  const { id } = params;
  const router = useRouter();
  const { business } = useBusinessStore();
  const toast = useToast();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'configure' | 'test'>('configure');
  const [callDuration, setCallDuration] = useState(0);
  const [callTimer, setCallTimer] = useState<NodeJS.Timeout | null>(null);

  const { transcript, connectionState, reset: resetVoice } = useVoiceStore();
  const { connect, disconnect, toggleMute, isMuted } = useRealtimeVoice({
    businessId: business?.id || '',
    onConversationEnd: () => {
      if (callTimer) clearInterval(callTimer);
      setCallDuration(0);
    },
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
  });

  useEffect(() => {
    if (!business) return;
    getAgents(business.id)
      .then((agents) => {
        const found = agents.find((a) => a.id === id);
        if (!found) { router.push('/dashboard/agents'); return; }
        setAgent(found);
        reset({
          name: found.name, voice: found.voice, language: found.language, personality: found.personality,
          greeting_message: found.greeting_message || '', system_prompt: found.system_prompt || '',
          max_call_duration: found.max_call_duration, interrupt_sensitivity: found.interrupt_sensitivity,
          is_active: found.is_active,
        });
      })
      .catch(() => toast.error('Failed to load agent'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business, id]);

  useEffect(() => {
    return () => {
      disconnect();
      resetVoice();
      if (callTimer) clearInterval(callTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (connectionState.status === 'listening' || connectionState.status === 'speaking') {
      if (!callTimer) {
        const timer = setInterval(() => setCallDuration((d) => d + 1), 1000);
        setCallTimer(timer);
      }
    } else if (connectionState.status === 'idle') {
      if (callTimer) { clearInterval(callTimer); setCallTimer(null); }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionState.status]);

  const onSave = async (data: AgentFormData) => {
    if (!agent) return;
    try {
      const updated = await updateAgent(agent.id, data);
      setAgent(updated);
      toast.success('Agent saved', 'Changes will apply to the next call');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error('Failed to save agent', msg);
    }
  };

  const handleConnect = async () => {
    if (!business) { toast.error('No business configured'); return; }
    setCallDuration(0);
    await connect();
  };

  const handleDisconnect = async () => {
    await disconnect();
    if (callTimer) { clearInterval(callTimer); setCallTimer(null); }
    setCallDuration(0);
  };

  const handleReset = () => {
    resetVoice();
    setCallDuration(0);
    if (callTimer) { clearInterval(callTimer); setCallTimer(null); }
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const isConnected = ['listening', 'speaking', 'connected'].includes(connectionState.status);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="h-96 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
          <div className="h-96 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
        </div>
      </div>
    );
  }

  if (!agent) return null;

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/agents">
          <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>Back</Button>
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-[15px] font-semibold" style={{ color: '#e2e8f0' }}>{agent.name}</h1>
            <div className="flex items-center gap-1.5">
              <Badge variant={agent.is_active ? 'green' : 'gray'}>
                {agent.is_active ? 'Active' : 'Inactive'}
              </Badge>
              <span className="text-[11px]" style={{ color: '#3d5060' }}>Voice: {agent.voice} · {agent.personality}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl p-1 w-fit"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {([
          { id: 'configure', label: 'Configure', icon: Settings2 },
          { id: 'test', label: 'Test Live', icon: Play },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-150"
            style={activeTab === tab.id
              ? { background: 'rgba(255,255,255,0.1)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }
              : { color: '#4b6070' }
            }
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'configure' ? (
          <motion.div
            key="configure"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader title="Agent Configuration" description="Update how this agent behaves on calls" />
              <form onSubmit={handleSubmit(onSave)} className="space-y-5">
                <Input label="Agent Name" placeholder="Reception AI" error={errors.name?.message} required {...register('name')} />
                <div className="grid grid-cols-2 gap-4">
                  <Select label="Voice" options={AGENT_VOICES.map((v) => ({ value: v.value, label: v.label }))} error={errors.voice?.message} {...register('voice')} />
                  <Select label="Personality" options={AGENT_PERSONALITIES.map((p) => ({ value: p.value, label: p.label }))} error={errors.personality?.message} {...register('personality')} />
                </div>
                <Select label="Interruption Sensitivity" options={INTERRUPT_SENSITIVITIES.map((i) => ({ value: i.value, label: i.label }))} {...register('interrupt_sensitivity')} />
                <Textarea
                  label="Greeting Message"
                  rows={2}
                  placeholder="Hello! Thank you for calling..."
                  hint="First thing the AI says when the call connects"
                  {...register('greeting_message')}
                />
                <Textarea
                  label="System Prompt"
                  rows={8}
                  placeholder="You are a professional auto repair receptionist..."
                  hint="Full instructions for how the AI should behave, what it knows, and how it handles calls"
                  {...register('system_prompt')}
                />
                <div className="flex items-center gap-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  <Button type="submit" loading={isSubmitting} icon={<Wand2 className="w-4 h-4" />}>
                    Save Configuration
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setActiveTab('test')} icon={<Play className="w-4 h-4" />}>
                    Test This Agent
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="test"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-5"
          >
            {/* Left: Voice Interface */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader title="Live Test" description="Talk to your agent in real time" />

                {/* Agent Info */}
                <div className="flex items-center gap-3 p-3 rounded-xl mb-5"
                  style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold" style={{ color: '#e2e8f0' }}>{agent.name}</div>
                    <div className="text-[11px]" style={{ color: '#4b6070' }}>{agent.voice} voice · {agent.personality}</div>
                  </div>
                  <Badge variant={agent.is_active ? 'green' : 'gray'}>
                    {agent.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {/* Orb + Controls */}
                <div className="flex flex-col items-center gap-6 py-4">
                  <div className="relative flex items-center justify-center">
                    {connectionState.status === 'speaking' && (
                      <>
                        <motion.div
                          className="absolute w-36 h-36 rounded-full"
                          style={{ background: 'rgba(34,197,94,0.12)' }}
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <motion.div
                          className="absolute w-44 h-44 rounded-full"
                          style={{ background: 'rgba(34,197,94,0.06)' }}
                          animate={{ scale: [1, 1.4, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                        />
                      </>
                    )}
                    {connectionState.status === 'listening' && (
                      <motion.div
                        className="absolute w-36 h-36 rounded-full"
                        style={{ border: '2px solid rgba(34,197,94,0.3)' }}
                        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}

                    <motion.button
                      onClick={isConnected ? toggleMute : handleConnect}
                      whileTap={{ scale: 0.95 }}
                      disabled={connectionState.status === 'connecting'}
                      className={cn(
                        'w-28 h-28 rounded-full flex items-center justify-center z-10 transition-all duration-300',
                        connectionState.status === 'connecting' && 'cursor-not-allowed',
                        connectionState.status === 'error' && 'cursor-pointer',
                        isMuted && isConnected && 'cursor-pointer',
                      )}
                      style={
                        connectionState.status === 'connecting'
                          ? { background: 'rgba(255,255,255,0.06)' }
                          : connectionState.status === 'error'
                          ? { background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.3)' }
                          : isMuted && isConnected
                          ? { background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.12)' }
                          : {
                              background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                              boxShadow: '0 0 40px rgba(34,197,94,0.35), 0 0 80px rgba(34,197,94,0.15)',
                            }
                      }
                    >
                      {connectionState.status === 'connecting' ? (
                        <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#4ade80' }} />
                      ) : connectionState.status === 'error' ? (
                        <AlertCircle className="w-10 h-10" style={{ color: '#f87171' }} />
                      ) : isConnected ? (
                        isMuted ? (
                          <MicOff className="w-10 h-10" style={{ color: '#64748b' }} />
                        ) : (
                          <Mic className="w-10 h-10 text-white" />
                        )
                      ) : (
                        <Mic className="w-10 h-10 text-white" />
                      )}
                    </motion.button>
                  </div>

                  {/* Status */}
                  <div className="text-center">
                    {connectionState.status === 'idle' && (
                      <div>
                        <p className="text-[13px] font-medium" style={{ color: '#94a3b8' }}>Ready to test</p>
                        <p className="text-[11px] mt-0.5" style={{ color: '#3d5060' }}>Click the mic to start a call</p>
                      </div>
                    )}
                    {connectionState.status === 'connecting' && (
                      <p className="text-[13px] font-medium" style={{ color: '#4ade80' }}>Connecting...</p>
                    )}
                    {connectionState.status === 'listening' && (
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1.5">
                          <motion.div className="w-2 h-2 rounded-full bg-green-500" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
                          <span className="text-[13px] font-medium" style={{ color: '#4ade80' }}>Listening</span>
                        </div>
                        <span className="text-[11px]" style={{ color: '#3d5060' }}>Speak now — the agent is hearing you</span>
                      </div>
                    )}
                    {connectionState.status === 'speaking' && (
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1.5">
                          <motion.div className="w-2 h-2 rounded-full bg-green-400" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
                          <span className="text-[13px] font-medium" style={{ color: '#4ade80' }}>Agent Speaking</span>
                        </div>
                        <span className="text-[11px]" style={{ color: '#3d5060' }}>The AI is responding</span>
                      </div>
                    )}
                    {connectionState.status === 'error' && (
                      <div>
                        <p className="text-[13px] font-medium" style={{ color: '#f87171' }}>Connection failed</p>
                        <p className="text-[11px] mt-0.5" style={{ color: '#3d5060' }}>{connectionState.error}</p>
                      </div>
                    )}
                  </div>

                  {/* Duration */}
                  {isConnected && callDuration > 0 && (
                    <div className="flex items-center gap-1.5 text-[11px]" style={{ color: '#4b6070' }}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDuration(callDuration)}</span>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    {isConnected && (
                      <button
                        onClick={handleDisconnect}
                        className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium rounded-full transition-colors"
                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.15)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; }}
                      >
                        <PhoneOff className="w-3.5 h-3.5" />
                        End Call
                      </button>
                    )}
                    {(connectionState.status === 'idle' || connectionState.status === 'error') && transcript.length > 0 && (
                      <button
                        onClick={handleReset}
                        className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium rounded-full transition-colors"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Tip */}
                <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                  <p className="text-[11px] font-semibold mb-1" style={{ color: '#60a5fa' }}>Testing tips</p>
                  <ul className="text-[11px] space-y-1" style={{ color: '#3b82f6' }}>
                    <li>· Allow microphone access when prompted</li>
                    <li>· Test booking an appointment end-to-end</li>
                    <li>· Ask about services, hours, and pricing</li>
                  </ul>
                </div>
              </Card>
            </div>

            {/* Right: Transcript */}
            <div className="lg:col-span-3">
              <Card className="h-full flex flex-col">
                <CardHeader
                  title="Conversation Transcript"
                  description={transcript.length > 0 ? `${transcript.length} messages` : 'Transcript appears here during the call'}
                  action={
                    transcript.length > 0 ? (
                      <Button variant="ghost" size="sm" icon={<RotateCcw className="w-3.5 h-3.5" />} onClick={handleReset}>
                        Clear
                      </Button>
                    ) : undefined
                  }
                />

                <div className="flex-1 min-h-0">
                  {transcript.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <MessageSquare className="w-6 h-6" style={{ color: '#2a3f4d' }} />
                      </div>
                      <p className="text-[13px] font-medium" style={{ color: '#4b6070' }}>No conversation yet</p>
                      <p className="text-[11px] mt-1" style={{ color: '#2a3f4d' }}>Start a call to see the transcript in real time</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 pb-2">
                      {transcript.map((entry, i) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className={cn('flex gap-2.5', entry.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
                        >
                          <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                            style={entry.role === 'assistant'
                              ? { background: 'rgba(34,197,94,0.15)', color: '#4ade80' }
                              : { background: 'rgba(255,255,255,0.07)', color: '#64748b' }
                            }>
                            {entry.role === 'assistant'
                              ? <Bot className="w-3.5 h-3.5" />
                              : <User className="w-3.5 h-3.5" />
                            }
                          </div>
                          <div className="max-w-[78%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed"
                            style={entry.role === 'assistant'
                              ? { background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', color: '#cbd5e1', borderTopLeftRadius: 4 }
                              : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', borderTopRightRadius: 4 }
                            }>
                            {entry.content}
                            <div className="text-[10px] mt-1" style={{ color: entry.role === 'assistant' ? 'rgba(74,222,128,0.5)' : 'rgba(148,163,184,0.4)' }}>
                              {entry.role === 'assistant' ? agent.name : 'You'} · {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {/* Live typing indicator */}
                      {connectionState.status === 'speaking' && (
                        <div className="flex gap-2.5">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}>
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                          <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-sm"
                            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
                            <div className="flex gap-1 items-center h-4">
                              {[0, 0.2, 0.4].map((delay) => (
                                <motion.div
                                  key={delay}
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ background: '#4ade80' }}
                                  animate={{ y: [0, -4, 0] }}
                                  transition={{ duration: 0.6, repeat: Infinity, delay }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Call ended summary */}
                {!isConnected && transcript.length > 0 && (
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="flex items-center gap-2 text-[12px]" style={{ color: '#4b6070' }}>
                      <CheckCircle2 className="w-4 h-4" style={{ color: '#4ade80' }} />
                      <span>Call ended · {transcript.length} messages exchanged · {formatDuration(callDuration)}</span>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
