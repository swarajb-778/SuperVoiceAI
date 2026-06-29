export const APP_NAME = 'CarBot AI';
export const APP_DESCRIPTION = 'AI Voice Receptionist for Auto Repair Businesses';

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const AGENT_VOICES = [
  { value: 'alloy', label: 'Alloy - Neutral' },
  { value: 'echo', label: 'Echo - Male' },
  { value: 'fable', label: 'Fable - British' },
  { value: 'onyx', label: 'Onyx - Deep Male' },
  { value: 'nova', label: 'Nova - Female' },
  { value: 'shimmer', label: 'Shimmer - Soft Female' },
] as const;

export const AGENT_PERSONALITIES = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'formal', label: 'Formal' },
  { value: 'casual', label: 'Casual' },
] as const;

export const INTERRUPT_SENSITIVITIES = [
  { value: 'low', label: 'Low - Let AI finish speaking' },
  { value: 'medium', label: 'Medium - Balanced' },
  { value: 'high', label: 'High - Interrupt immediately' },
] as const;

export const PRICE_TYPES = [
  { value: 'fixed', label: 'Fixed Price' },
  { value: 'range', label: 'Price Range' },
  { value: 'starting_at', label: 'Starting At' },
  { value: 'call_for_price', label: 'Call for Price' },
] as const;

export const APPOINTMENT_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'confirmed', label: 'Confirmed', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
  { value: 'no_show', label: 'No Show', color: 'gray' },
] as const;

export const LEAD_STATUSES = [
  { value: 'new', label: 'New', color: 'blue' },
  { value: 'contacted', label: 'Contacted', color: 'yellow' },
  { value: 'qualified', label: 'Qualified', color: 'purple' },
  { value: 'converted', label: 'Converted', color: 'green' },
  { value: 'lost', label: 'Lost', color: 'red' },
] as const;

export const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
  'America/Puerto_Rico',
];

export const DEFAULT_GREETING =
  "Hello! Thank you for calling. I'm an AI assistant here to help you with appointments, service questions, and more. How can I assist you today?";

export const DEFAULT_SYSTEM_PROMPT = `You are a professional AI receptionist for an auto repair shop. Your job is to:
1. Greet customers warmly and professionally
2. Answer questions about services and pricing
3. Check available appointment slots and book appointments
4. Collect customer and vehicle information
5. Handle callback requests
6. Provide business hours and location information

Always be helpful, concise, and professional. When booking appointments, collect:
- Customer name
- Phone number
- Vehicle year, make, and model
- Service needed
- Preferred date and time

Use the available tools to check schedules and create bookings. Never make up information about services or pricing - use the provided tools to get accurate data.`;

export const WIDGET_POSITIONS = [
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
] as const;

export const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30',
];

export const SUGGESTED_SERVICES = [
  { name: 'Oil Change', description: 'Full synthetic or conventional oil change with filter replacement', duration_minutes: 30, price_type: 'fixed' as const, price_min: 49.99, price_max: null },
  { name: 'Tire Rotation', description: 'Rotate all four tires to ensure even wear and extend tire life', duration_minutes: 30, price_type: 'fixed' as const, price_min: 29.99, price_max: null },
  { name: 'Brake Inspection', description: 'Comprehensive brake system inspection including pads, rotors, and fluid', duration_minutes: 45, price_type: 'starting_at' as const, price_min: 39.99, price_max: null },
  { name: 'Brake Pad Replacement', description: 'Replace front or rear brake pads for safe stopping performance', duration_minutes: 90, price_type: 'range' as const, price_min: 149.99, price_max: 299.99 },
  { name: 'Multi-Point Inspection', description: '50-point vehicle inspection covering all major systems', duration_minutes: 60, price_type: 'fixed' as const, price_min: 0, price_max: null },
  { name: 'Battery Replacement', description: 'Test and replace vehicle battery with premium AGM or standard battery', duration_minutes: 30, price_type: 'starting_at' as const, price_min: 129.99, price_max: null },
  { name: 'Air Filter Replacement', description: 'Replace engine and cabin air filters for optimal performance', duration_minutes: 20, price_type: 'range' as const, price_min: 24.99, price_max: 59.99 },
  { name: 'Transmission Service', description: 'Transmission fluid flush and filter replacement service', duration_minutes: 90, price_type: 'starting_at' as const, price_min: 179.99, price_max: null },
  { name: 'Wheel Alignment', description: 'Four-wheel alignment check and adjustment for proper handling', duration_minutes: 60, price_type: 'fixed' as const, price_min: 89.99, price_max: null },
  { name: 'AC Service', description: 'AC system check, refrigerant recharge, and leak inspection', duration_minutes: 60, price_type: 'starting_at' as const, price_min: 99.99, price_max: null },
  { name: 'Check Engine Light Diagnosis', description: 'Full diagnostic scan and detailed report of trouble codes', duration_minutes: 60, price_type: 'fixed' as const, price_min: 79.99, price_max: null },
  { name: 'Coolant Flush', description: 'Drain and refill cooling system with fresh coolant', duration_minutes: 45, price_type: 'fixed' as const, price_min: 89.99, price_max: null },
];

export const SUGGESTED_AGENTS = [
  {
    name: 'Alex – Professional Receptionist',
    voice: 'alloy' as const,
    personality: 'professional' as const,
    interrupt_sensitivity: 'medium' as const,
    greeting_message: "Hello! Thank you for calling. I'm Alex, your AI receptionist. I can help you schedule an appointment, answer questions about our services, or provide any other information you need. How can I assist you today?",
    system_prompt: `You are Alex, a professional AI receptionist for an auto repair shop. Your primary goals are to help customers schedule appointments, answer questions about services and pricing, and capture lead information.

BOOKING FLOW:
1. Ask what service they need
2. Collect vehicle info (year, make, model)
3. Check available slots and confirm date/time
4. Collect customer name, phone, and email
5. Confirm all details before finalizing

Always be concise, warm, and professional. Never make up prices — use the tools to fetch accurate data. If you can't help, offer a callback.`,
  },
  {
    name: 'Sam – Friendly Advisor',
    voice: 'nova' as const,
    personality: 'friendly' as const,
    interrupt_sensitivity: 'high' as const,
    greeting_message: "Hi there! Thanks for calling! I'm Sam, and I'm here to make your experience as easy as possible. Whether you need to book a service or have questions, I've got you covered! What can I help you with?",
    system_prompt: `You are Sam, a friendly and upbeat AI assistant for an auto repair shop. You make customers feel welcome and at ease.

STYLE: Conversational, warm, use casual language but remain professional. Use phrases like "Great choice!", "Absolutely!", "No problem at all!".

GOALS:
- Book appointments quickly and efficiently
- Answer service and pricing questions
- Collect vehicle and customer details
- Offer callbacks when needed

Keep responses short and energetic. Always confirm appointment details with enthusiasm.`,
  },
  {
    name: 'Morgan – Formal Consultant',
    voice: 'onyx' as const,
    personality: 'formal' as const,
    interrupt_sensitivity: 'low' as const,
    greeting_message: "Good day. Thank you for contacting us. I am Morgan, your dedicated service consultant. I am here to assist you with scheduling, service inquiries, and any information regarding your vehicle maintenance. How may I be of service?",
    system_prompt: `You are Morgan, a formal and highly professional AI service consultant for a premium auto repair establishment.

COMMUNICATION STYLE: Precise, respectful, and thorough. Use complete sentences. Address customers formally. Never use contractions.

PROCESS:
- Gather complete customer and vehicle information before proceeding
- Provide detailed service descriptions and accurate pricing
- Confirm all appointment details thoroughly
- Always offer a summary of the booking before finalizing

Maintain the highest standard of professionalism at all times.`,
  },
];

export const ANALYTICS_EVENT_TYPES = {
  CONVERSATION_STARTED: 'conversation_started',
  CONVERSATION_ENDED: 'conversation_ended',
  APPOINTMENT_BOOKED: 'appointment_booked',
  CALLBACK_REQUESTED: 'callback_requested',
  SERVICE_INQUIRY: 'service_inquiry',
  WIDGET_IMPRESSION: 'widget_impression',
  WIDGET_OPENED: 'widget_opened',
} as const;
