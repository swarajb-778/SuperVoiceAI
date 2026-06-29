'use client'

import { useEffect, useState } from 'react'
import { useBusinessStore } from '@/store/business'
import { updateBusiness, createBusiness, getBusinessHours, updateBusinessHours } from '@/services/business'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Tabs } from '@/components/ui/Tabs'
import { Toggle } from '@/components/ui/Toggle'
import { useToast } from '@/components/ui/Toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { businessSchema, type BusinessFormData } from '@/validations'
import { TIMEZONES, DAYS_OF_WEEK } from '@/constants'
import { createClient } from '@/lib/supabase/client'

type HourRow = { day_of_week: number; is_open: boolean; open_time: string; close_time: string }

export default function SettingsPage() {
  const { business, setBusiness, isLoading: businessLoading } = useBusinessStore()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('business')
  const [hours, setHours] = useState<HourRow[]>([])
  const [hoursLoading, setHoursLoading] = useState(false)
  const [hoursSaving, setHoursSaving] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: { timezone: 'America/New_York' },
  })

  useEffect(() => {
    if (business) {
      reset({
        name: business.name, phone: business.phone || '', email: business.email || '',
        address: business.address || '', city: business.city || '', state: business.state || '',
        zip: business.zip || '', website: business.website || '', timezone: business.timezone,
      })
    }
  }, [business, reset])

  useEffect(() => {
    if (!business || activeTab !== 'hours') return
    setHoursLoading(true)
    getBusinessHours(business.id)
      .then((data) => {
        const base: HourRow[] = DAYS_OF_WEEK.map((_, i) => {
          const found = data.find((h) => h.day_of_week === i)
          return { day_of_week: i, is_open: found?.is_open ?? (i !== 0 && i !== 6), open_time: found?.open_time || '08:00', close_time: found?.close_time || '18:00' }
        })
        setHours(base)
      })
      .catch(() => toast.error('Failed to load business hours'))
      .finally(() => setHoursLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business, activeTab])

  const onBusinessSubmit = async (data: BusinessFormData) => {
    try {
      if (business) {
        const updated = await updateBusiness(business.id, data)
        setBusiness(updated)
        toast.success('Business profile saved')
      } else {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { toast.error('Not authenticated'); return }
        const created = await createBusiness(user.id, data)
        setBusiness(created)
        toast.success('Business profile created', 'Your business is now set up')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      toast.error('Failed to save business profile', msg)
    }
  }

  const saveHours = async () => {
    if (!business) { toast.error('Save your business profile first'); return }
    setHoursSaving(true)
    try {
      await updateBusinessHours(business.id, hours)
      toast.success('Business hours saved')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      toast.error('Failed to save hours', msg)
    } finally {
      setHoursSaving(false)
    }
  }

  const updateHour = (dayIndex: number, field: keyof HourRow, value: string | boolean) => {
    setHours((prev) => prev.map((h, i) => (i === dayIndex ? { ...h, [field]: value } : h)))
  }

  if (businessLoading) {
    return (
      <div className="space-y-5 max-w-2xl">
        <div className="h-10 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="card-surface p-5 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-9 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <Tabs
        tabs={[
          { id: 'business', label: 'Business Profile' },
          { id: 'hours', label: 'Business Hours' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === 'business' && (
        <Card>
          <CardHeader
            title={business ? 'Business Profile' : 'Set Up Your Business'}
            description={business ? 'Update your business information' : 'Enter your business details to get started'}
          />
          <form onSubmit={handleSubmit(onBusinessSubmit)} className="space-y-4">
            <Input label="Business Name" error={errors.name?.message} required {...register('name')} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Phone" type="tel" placeholder="(555) 000-0000" error={errors.phone?.message} {...register('phone')} />
              <Input label="Email" type="email" placeholder="info@yourshop.com" error={errors.email?.message} {...register('email')} />
            </div>
            <Input label="Address" placeholder="123 Main Street" {...register('address')} />
            <div className="grid grid-cols-3 gap-4">
              <Input label="City" {...register('city')} />
              <Input label="State" placeholder="CA" {...register('state')} />
              <Input label="ZIP" {...register('zip')} />
            </div>
            <Input label="Website" type="url" placeholder="https://yourshop.com" error={errors.website?.message} {...register('website')} />
            <Select
              label="Timezone"
              options={TIMEZONES.map((tz) => ({ value: tz, label: tz.replace('America/', '').replace(/_/g, ' ') }))}
              {...register('timezone')}
            />
            <div className="pt-2">
              <Button type="submit" loading={isSubmitting}>
                {business ? 'Save Changes' : 'Create Business Profile'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {activeTab === 'hours' && (
        <Card>
          <CardHeader title="Business Hours" description="Set when your business is open" />
          {!business ? (
            <div className="py-6 text-center text-[13px]" style={{ color: '#4b6070' }}>
              Save your business profile first to configure hours.
            </div>
          ) : hoursLoading ? (
            <div className="space-y-3">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-9 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {hours.map((hour, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-24 text-[13px] font-medium" style={{ color: '#94a3b8' }}>
                    {DAYS_OF_WEEK[hour.day_of_week]}
                  </div>
                  <Toggle size="sm" checked={hour.is_open} onChange={(v) => updateHour(i, 'is_open', v)} />
                  {hour.is_open ? (
                    <>
                      <input
                        type="time"
                        value={hour.open_time}
                        onChange={(e) => updateHour(i, 'open_time', e.target.value)}
                        className="w-28 text-[12px] py-1.5 px-2 rounded-lg outline-none"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0', colorScheme: 'dark' }}
                      />
                      <span className="text-[13px]" style={{ color: '#3d5060' }}>to</span>
                      <input
                        type="time"
                        value={hour.close_time}
                        onChange={(e) => updateHour(i, 'close_time', e.target.value)}
                        className="w-28 text-[12px] py-1.5 px-2 rounded-lg outline-none"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0', colorScheme: 'dark' }}
                      />
                    </>
                  ) : (
                    <span className="text-[13px] ml-2" style={{ color: '#3d5060' }}>Closed</span>
                  )}
                </div>
              ))}

              <div className="pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <Button onClick={saveHours} loading={hoursSaving}>Save Hours</Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
