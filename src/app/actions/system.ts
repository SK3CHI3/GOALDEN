'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from './auth'

export async function getSystemSettings() {
  const supabase = await createClient()
  const user = await getCurrentUser()

  if (!user || user.role !== 'admin') {
    return { error: 'Unauthorized', data: null }
  }

  // Get settings from database (or use defaults)
  const { data, error } = await supabase
    .from('system_settings')
    .select('*')
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    return { error: error.message, data: null }
  }

  // Return default settings if none exist
  const defaultSettings = {
    platform: {
      name: 'GOALDEN',
      version: '1.2.0',
      maintenance_mode: false,
      registration_enabled: true,
      tournaments_enabled: true
    },
    security: {
      password_min_length: 8,
      session_timeout: 24,
      two_factor_enabled: false,
      ip_whitelist: []
    },
    notifications: {
      email_enabled: true,
      sms_enabled: false,
      push_enabled: true,
      whatsapp_enabled: false
    },
    payments: {
      mpesa_enabled: true,
      stripe_enabled: false,
      minimum_amount: 50,
      maximum_amount: 10000
    }
  }

  if (data) {
    // Merge with defaults
    return {
      data: {
        platform: { ...defaultSettings.platform, ...(data.platform || {}) },
        security: { ...defaultSettings.security, ...(data.security || {}) },
        notifications: { ...defaultSettings.notifications, ...(data.notifications || {}) },
        payments: { ...defaultSettings.payments, ...(data.payments || {}) }
      },
      error: null
    }
  }

  return { data: defaultSettings, error: null }
}

export async function updateSystemSettings(settings: any) {
  const supabase = await createClient()
  const user = await getCurrentUser()

  if (!user || user.role !== 'admin') {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('system_settings')
    .upsert({
      id: 1,
      ...settings,
      updated_at: new Date().toISOString()
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/dashboard')
  return { error: null }
}

export async function getSystemHealth() {
  const supabase = await createClient()
  const user = await getCurrentUser()

  if (!user || user.role !== 'admin') {
    return { error: 'Unauthorized', data: null }
  }

  // Get active users (users active in last 30 minutes)
  const thirtyMinutesAgo = new Date()
  thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30)

  const { count: activeUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('updated_at', thirtyMinutesAgo.toISOString())

  // Get concurrent tournaments
  const { count: concurrentTournaments } = await supabase
    .from('tournaments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'ongoing')

  // Test database connection
  const startTime = Date.now()
  const { error: dbError } = await supabase
    .from('profiles')
    .select('id')
    .limit(1)
  const responseTime = Date.now() - startTime

  let databaseStatus: 'connected' | 'disconnected' | 'slow' = 'connected'
  if (dbError) {
    databaseStatus = 'disconnected'
  } else if (responseTime > 1000) {
    databaseStatus = 'slow'
  }

  // Calculate uptime (simplified - in production, track actual uptime)
  const uptime = 99.9 // This would be calculated from actual uptime tracking

  // Storage usage (simplified - would need actual storage API)
  const storageUsage = 65 // This would come from storage API

  // Memory and CPU (would need server metrics API)
  const memoryUsage = 45
  const cpuUsage = 23

  return {
    data: {
      status: databaseStatus === 'connected' ? 'healthy' : 'critical',
      uptime,
      response_time: responseTime,
      database_status: databaseStatus,
      storage_usage: storageUsage,
      memory_usage: memoryUsage,
      cpu_usage: cpuUsage,
      active_users: activeUsers || 0,
      concurrent_tournaments: concurrentTournaments || 0
    },
    error: null
  }
}

export async function getUserRoles() {
  const supabase = await createClient()
  const user = await getCurrentUser()

  if (!user || user.role !== 'admin') {
    return { error: 'Unauthorized', data: null }
  }

  // Get user roles from profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('role')

  if (error) {
    return { error: error.message, data: null }
  }

  // Count users by role
  const roleCounts = profiles?.reduce((acc, profile) => {
    const role = profile.role || 'player'
    acc[role] = (acc[role] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  // Define role permissions
  const rolePermissions: Record<string, string[]> = {
    admin: ['all'],
    player: ['tournaments', 'matches']
  }

  const userRoles = Object.entries(roleCounts).map(([name, user_count]) => ({
    id: name,
    name: name.charAt(0).toUpperCase() + name.slice(1),
    permissions: rolePermissions[name] || [],
    created_at: '2024-01-01',
    user_count
  }))

  return { data: userRoles, error: null }
}

