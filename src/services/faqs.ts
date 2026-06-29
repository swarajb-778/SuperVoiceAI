import { createClient } from '@/lib/supabase/client';
import type { FAQ } from '@/types';
import type { FaqFormData } from '@/validations';

export async function getFaqs(businessId: string): Promise<FAQ[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('business_id', businessId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createFaq(
  businessId: string,
  data: FaqFormData
): Promise<FAQ> {
  const supabase = createClient();

  const { data: faq, error } = await supabase
    .from('faqs')
    .insert({
      business_id: businessId,
      question: data.question,
      answer: data.answer,
      category: data.category || null,
      is_active: data.is_active,
      sort_order: data.sort_order,
    })
    .select()
    .single();

  if (error) throw error;
  return faq;
}

export async function updateFaq(
  faqId: string,
  data: Partial<FaqFormData>
): Promise<FAQ> {
  const supabase = createClient();

  const { data: faq, error } = await supabase
    .from('faqs')
    .update({
      question: data.question,
      answer: data.answer,
      category: data.category || null,
      is_active: data.is_active,
      sort_order: data.sort_order,
    })
    .eq('id', faqId)
    .select()
    .single();

  if (error) throw error;
  return faq;
}

export async function deleteFaq(faqId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('faqs')
    .delete()
    .eq('id', faqId);

  if (error) throw error;
}
