export interface Business {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  website: string | null;
  logo_url: string | null;
  timezone: string;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  business_id: string;
  name: string;
  voice: AgentVoice;
  language: string;
  personality: AgentPersonality;
  greeting_message: string | null;
  system_prompt: string | null;
  is_active: boolean;
  max_call_duration: number;
  interrupt_sensitivity: InterruptSensitivity;
  created_at: string;
  updated_at: string;
}

export type AgentVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
export type AgentPersonality = 'professional' | 'friendly' | 'formal' | 'casual';
export type InterruptSensitivity = 'low' | 'medium' | 'high';

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_min: number | null;
  price_max: number | null;
  price_type: PriceType;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type PriceType = 'fixed' | 'range' | 'starting_at' | 'call_for_price';

export interface BusinessHours {
  id: string;
  business_id: string;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_open: boolean;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  business_id: string;
  service_id: string | null;
  conversation_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  vehicle_year: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  notes: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: AppointmentStatus;
  created_at: string;
  updated_at: string;
  service?: Service;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface Conversation {
  id: string;
  business_id: string;
  agent_id: string | null;
  caller_name: string | null;
  caller_phone: string | null;
  caller_email: string | null;
  status: ConversationStatus;
  duration_seconds: number | null;
  appointment_booked: boolean;
  callback_requested: boolean;
  sentiment: ConversationSentiment | null;
  summary: string | null;
  source: ConversationSource;
  created_at: string;
  updated_at: string;
  messages?: ConversationMessage[];
}

export type ConversationStatus = 'active' | 'completed' | 'abandoned';
export type ConversationSentiment = 'positive' | 'neutral' | 'negative';
export type ConversationSource = 'widget' | 'embed' | 'direct';

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  tool_name: string | null;
  tool_result: Record<string, unknown> | null;
  created_at: string;
}

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface FAQ {
  id: string;
  business_id: string;
  question: string;
  answer: string;
  category: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  business_id: string;
  conversation_id: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  vehicle_year: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  service_interest: string | null;
  notes: string | null;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';

export interface EmbeddedWidget {
  id: string;
  business_id: string;
  agent_id: string | null;
  name: string;
  position: WidgetPosition;
  primary_color: string;
  greeting: string | null;
  is_active: boolean;
  allowed_domains: string[] | null;
  total_impressions: number;
  total_interactions: number;
  created_at: string;
  updated_at: string;
}

export type WidgetPosition = 'bottom-right' | 'bottom-left';

export interface AnalyticsEvent {
  id: string;
  business_id: string;
  conversation_id: string | null;
  event_type: string;
  event_data: Record<string, unknown> | null;
  created_at: string;
}

export interface DashboardAnalytics {
  total_conversations: number;
  appointments_booked: number;
  conversion_rate: number;
  avg_call_duration: number;
  callback_requests: number;
  conversations_today: number;
  conversations_this_week: number;
  conversations_this_month: number;
  appointments_today: number;
  appointments_this_week: number;
}

export interface AvailableSlot {
  date: string;
  time: string;
  datetime: string;
}

export interface RealtimeSessionResponse {
  conversationId: string;
  agentName: string;
  voice: string;
  model: string;
  systemPrompt: string;
  tools: unknown[];
  turnDetection: {
    type: string;
    threshold: number;
    prefix_padding_ms: number;
    silence_duration_ms: number;
  };
}

export interface VoiceConnectionState {
  status: 'idle' | 'connecting' | 'connected' | 'speaking' | 'listening' | 'error';
  error?: string;
}

export interface TranscriptEntry {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
