import type { Business, Service, BusinessHours } from '@/types';
import { formatPrice } from '@/lib/utils';
import { DAYS_OF_WEEK } from '@/constants';

export const REALTIME_TOOLS = [
  {
    type: 'function' as const,
    name: 'getBusinessHours',
    description: 'Get the business operating hours for each day of the week',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    type: 'function' as const,
    name: 'getServices',
    description: 'Get all available auto repair services with pricing and duration',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    type: 'function' as const,
    name: 'getAvailableSlots',
    description: 'Get available appointment time slots for a specific date',
    parameters: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'The date to check availability for in YYYY-MM-DD format',
        },
        service_id: {
          type: 'string',
          description: 'Optional service ID to check duration-specific availability',
        },
      },
      required: ['date'],
    },
  },
  {
    type: 'function' as const,
    name: 'createAppointment',
    description: 'Book an appointment for a customer',
    parameters: {
      type: 'object',
      properties: {
        customer_name: {
          type: 'string',
          description: 'Full name of the customer',
        },
        customer_phone: {
          type: 'string',
          description: 'Customer phone number',
        },
        customer_email: {
          type: 'string',
          description: 'Customer email address (optional)',
        },
        vehicle_year: {
          type: 'string',
          description: 'Year of the vehicle',
        },
        vehicle_make: {
          type: 'string',
          description: 'Make/brand of the vehicle (e.g., Toyota, Ford)',
        },
        vehicle_model: {
          type: 'string',
          description: 'Model of the vehicle (e.g., Camry, F-150)',
        },
        service_id: {
          type: 'string',
          description: 'ID of the service being booked',
        },
        scheduled_at: {
          type: 'string',
          description: 'ISO 8601 datetime for the appointment (e.g., 2024-01-15T10:00:00)',
        },
        notes: {
          type: 'string',
          description: 'Any additional notes from the customer',
        },
      },
      required: ['customer_name', 'customer_phone', 'scheduled_at'],
    },
  },
  {
    type: 'function' as const,
    name: 'createLead',
    description: 'Capture a customer lead when they are interested but not ready to book',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Customer name',
        },
        phone: {
          type: 'string',
          description: 'Customer phone number',
        },
        email: {
          type: 'string',
          description: 'Customer email (optional)',
        },
        vehicle_year: { type: 'string' },
        vehicle_make: { type: 'string' },
        vehicle_model: { type: 'string' },
        service_interest: {
          type: 'string',
          description: 'What service they are interested in',
        },
        notes: { type: 'string' },
      },
      required: ['name', 'phone'],
    },
  },
  {
    type: 'function' as const,
    name: 'requestCallback',
    description: 'Schedule a callback for a customer who wants to be called back',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Customer name',
        },
        phone: {
          type: 'string',
          description: 'Callback phone number',
        },
        preferred_time: {
          type: 'string',
          description: 'Preferred callback time',
        },
        reason: {
          type: 'string',
          description: 'Reason for the callback',
        },
      },
      required: ['name', 'phone'],
    },
  },
];

export function buildSystemPrompt(
  business: Business,
  services: Service[],
  hours: BusinessHours[],
  agentSystemPrompt: string | null,
  faqs: Array<{ question: string; answer: string }>,
  language = 'en',
  greetingMessage?: string | null
): string {
  const langInstruction = language === 'en'
    ? 'LANGUAGE REQUIREMENT: You MUST always respond in English only, regardless of what language the customer speaks or writes in. If the customer speaks another language, politely let them know you can only assist in English and continue in English.'
    : `LANGUAGE REQUIREMENT: You MUST always respond in the following language: ${language}. Never switch to another language under any circumstances.`;

  const servicesText = services.length > 0
    ? services.map((s) => `- ${s.name}: ${formatPrice(s.price_min, s.price_max, s.price_type)}, ${s.duration_minutes} minutes`).join('\n')
    : 'Services not configured yet.';

  const hoursText = hours.map((h) => {
    if (!h.is_open) return `${DAYS_OF_WEEK[h.day_of_week]}: Closed`;
    return `${DAYS_OF_WEEK[h.day_of_week]}: ${h.open_time} - ${h.close_time}`;
  }).join('\n');

  const faqsText = faqs.length > 0
    ? faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')
    : '';

  const greetingInstruction = greetingMessage
    ? `OPENING GREETING: When the call starts, your very first response MUST be exactly: "${greetingMessage}"`
    : `OPENING GREETING: When the call starts, greet the caller warmly with something like "Hello! Thank you for calling ${business.name}, how can I help you today?"`;

  return `${langInstruction}

${greetingInstruction}

${agentSystemPrompt || ''}

BUSINESS INFORMATION:
Business Name: ${business.name}
Phone: ${business.phone || 'Not provided'}
Email: ${business.email || 'Not provided'}
Address: ${[business.address, business.city, business.state, business.zip].filter(Boolean).join(', ') || 'Not provided'}
Website: ${business.website || 'Not provided'}
Timezone: ${business.timezone}

SERVICES OFFERED:
${servicesText}

BUSINESS HOURS:
${hoursText}

${faqsText ? `FREQUENTLY ASKED QUESTIONS:\n${faqsText}` : ''}

IMPORTANT RULES:
- Always respond in English only — never switch languages
- Always collect customer name and phone before booking
- Always use the available tools to check slots before confirming times
- Never make up pricing - use the getServices tool for accurate pricing
- If a customer wants to book, use createAppointment tool
- If customer is not ready to book, use createLead to capture their information
- If customer requests a callback, use requestCallback tool
- Be professional, helpful, and concise
- Today's date context: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
}
