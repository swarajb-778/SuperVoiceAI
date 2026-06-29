'use client';

import { useEffect, useState, useCallback } from 'react';
import { MessageSquare, Search, ChevronRight } from 'lucide-react';
import { useBusinessStore } from '@/store/business';
import { getConversations, getConversationMessages } from '@/services/conversations';
import { Card, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { formatDateTime, formatDuration, formatTimeAgo } from '@/lib/utils';
import type { Conversation, ConversationMessage } from '@/types';

const PAGE_SIZE = 20;

export default function ConversationsPage() {
  const { business } = useBusinessStore();
  const toast = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const load = useCallback(async () => {
    if (!business) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data, count } = await getConversations(business.id, {
        status: statusFilter || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });
      setConversations(data);
      setTotal(count);
    } catch {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [business, statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  const openConversation = async (conv: Conversation) => {
    setSelectedConv(conv);
    setLoadingMessages(true);
    try {
      const msgs = await getConversationMessages(conv.id);
      setMessages(msgs);
    } catch {
      toast.error('Failed to load transcript');
    } finally {
      setLoadingMessages(false);
    }
  };

  const filtered = conversations.filter((c) =>
    !search || (c.caller_name && c.caller_name.toLowerCase().includes(search.toLowerCase())) ||
    (c.caller_phone && c.caller_phone.includes(search))
  );

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Conversations" description={`${total} total conversations`} />

        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="flex-1 min-w-48">
            <Input
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="w-40">
            <Select
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'completed', label: 'Completed' },
                { value: 'abandoned', label: 'Abandoned' },
              ]}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            />
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-[13px]" style={{ color: '#3d5060' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="w-5 h-5" />}
            title="No conversations yet"
            description="When customers interact with your AI agent, conversations will appear here"
          />
        ) : (
          <>
            <Table>
              <TableHead>
                <TableHeader>Caller</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Duration</TableHeader>
                <TableHeader>Sentiment</TableHeader>
                <TableHeader>Appointment</TableHeader>
                <TableHeader>Started</TableHeader>
                <TableHeader>{''}</TableHeader>
              </TableHead>
              <TableBody>
                {filtered.map((conv) => (
                  <TableRow key={conv.id} onClick={() => openConversation(conv)}>
                    <TableCell>
                      <div className="font-medium" style={{ color: '#e2e8f0' }}>{conv.caller_name || 'Unknown'}</div>
                      <div className="text-[11px]" style={{ color: '#3d5060' }}>{conv.caller_phone || '—'}</div>
                    </TableCell>
                    <TableCell><StatusBadge status={conv.status} /></TableCell>
                    <TableCell>
                      <span className="text-[12px]" style={{ color: '#64748b' }}>
                        {conv.duration_seconds ? formatDuration(conv.duration_seconds) : '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {conv.sentiment ? <StatusBadge status={conv.sentiment} /> : <span className="text-[12px]" style={{ color: '#3d5060' }}>—</span>}
                    </TableCell>
                    <TableCell>
                      <span className="text-[12px] font-medium" style={{ color: conv.appointment_booked ? '#4ade80' : '#3d5060' }}>
                        {conv.appointment_booked ? 'Booked' : '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[12px]" style={{ color: '#4b6070' }}>{formatTimeAgo(conv.created_at)}</span>
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="w-4 h-4" style={{ color: '#2a3f4d' }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {total > PAGE_SIZE && (
              <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <span className="text-[12px]" style={{ color: '#4b6070' }}>
                  Page {page + 1} of {Math.ceil(total / PAGE_SIZE)}
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

      <Modal
        isOpen={!!selectedConv}
        onClose={() => setSelectedConv(null)}
        title="Conversation Transcript"
        description={selectedConv ? `${formatDateTime(selectedConv.created_at)} · ${selectedConv.caller_name || 'Unknown caller'}` : ''}
        size="xl"
      >
        {loadingMessages ? (
          <div className="py-8 text-center text-[13px]" style={{ color: '#4b6070' }}>Loading transcript...</div>
        ) : messages.length === 0 ? (
          <div className="py-8 text-center text-[13px]" style={{ color: '#4b6070' }}>No transcript available</div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {messages.filter((m) => m.role === 'user' || m.role === 'assistant').map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-semibold"
                  style={msg.role === 'assistant'
                    ? { background: 'rgba(34,197,94,0.15)', color: '#4ade80' }
                    : { background: 'rgba(255,255,255,0.08)', color: '#94a3b8' }
                  }>
                  {msg.role === 'assistant' ? 'AI' : 'C'}
                </div>
                <div className="max-w-[80%] px-3 py-2 rounded-xl text-[13px]"
                  style={msg.role === 'assistant'
                    ? { background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', color: '#cbd5e1', borderTopLeftRadius: 0 }
                    : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', borderTopRightRadius: 0 }
                  }>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        )}
        {selectedConv?.summary && (
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="text-[11px] font-semibold mb-1" style={{ color: '#4b6070' }}>AI Summary</div>
            <p className="text-[13px]" style={{ color: '#94a3b8' }}>{selectedConv.summary}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
