import { z } from 'zod';

export const businessSchema = z.object({
  name: z.string().min(2, 'Business name must be at least 2 characters').max(100),
  phone: z.string().min(10, 'Enter a valid phone number').optional().or(z.literal('')),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  zip: z.string().optional().or(z.literal('')),
  website: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  timezone: z.string().min(1, 'Select a timezone'),
});

export const agentSchema = z.object({
  name: z.string().min(2, 'Agent name must be at least 2 characters').max(100),
  voice: z.enum(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']),
  language: z.string().default('en'),
  personality: z.enum(['professional', 'friendly', 'formal', 'casual']),
  greeting_message: z.string().max(500).optional().or(z.literal('')),
  system_prompt: z.string().max(2000).optional().or(z.literal('')),
  max_call_duration: z.number().min(60).max(3600).default(600),
  interrupt_sensitivity: z.enum(['low', 'medium', 'high']).default('medium'),
  is_active: z.boolean().default(true),
});

export const serviceSchema = z.object({
  name: z.string().min(2, 'Service name is required').max(100),
  description: z.string().max(500).optional().or(z.literal('')),
  duration_minutes: z.number().min(15).max(480).default(60),
  price_type: z.enum(['fixed', 'range', 'starting_at', 'call_for_price']),
  price_min: z.number().min(0).optional().nullable(),
  price_max: z.number().min(0).optional().nullable(),
  is_active: z.boolean().default(true),
  sort_order: z.number().default(0),
});

export const appointmentSchema = z.object({
  customer_name: z.string().min(2, 'Customer name is required'),
  customer_phone: z.string().min(10, 'Enter a valid phone number').optional().or(z.literal('')),
  customer_email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  vehicle_year: z.string().optional().or(z.literal('')),
  vehicle_make: z.string().optional().or(z.literal('')),
  vehicle_model: z.string().optional().or(z.literal('')),
  service_id: z.string().uuid().optional().nullable(),
  scheduled_at: z.string().min(1, 'Appointment date and time is required'),
  duration_minutes: z.number().min(15).max(480).default(60),
  notes: z.string().max(1000).optional().or(z.literal('')),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show']).default('pending'),
});

export const faqSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters').max(300),
  answer: z.string().min(5, 'Answer must be at least 5 characters').max(2000),
  category: z.string().max(50).optional().or(z.literal('')),
  is_active: z.boolean().default(true),
  sort_order: z.number().default(0),
});

export const widgetSchema = z.object({
  name: z.string().min(2, 'Widget name is required').max(100),
  agent_id: z.string().uuid().optional().nullable(),
  position: z.enum(['bottom-right', 'bottom-left']).default('bottom-right'),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Enter a valid hex color').default('#22c55e'),
  greeting: z.string().max(300).optional().or(z.literal('')),
  is_active: z.boolean().default(true),
  allowed_domains: z.array(z.string()).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  business_name: z.string().min(2, 'Business name must be at least 2 characters'),
});

export const businessHoursSchema = z.object({
  hours: z.array(z.object({
    day_of_week: z.number().min(0).max(6),
    is_open: z.boolean(),
    open_time: z.string().optional().nullable(),
    close_time: z.string().optional().nullable(),
  })),
});

export type BusinessFormData = z.infer<typeof businessSchema>;
export type AgentFormData = z.infer<typeof agentSchema>;
export type ServiceFormData = z.infer<typeof serviceSchema>;
export type AppointmentFormData = z.infer<typeof appointmentSchema>;
export type FaqFormData = z.infer<typeof faqSchema>;
export type WidgetFormData = z.infer<typeof widgetSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type BusinessHoursFormData = z.infer<typeof businessHoursSchema>;
